import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { ConvexError, v } from "convex/values"
import { internal } from "../_generated/api"
import { internalAction, mutation } from "../_generated/server"
import { createAgent } from "../agent"
import { stackServerApp } from "../lib/stack"
import { getCurrentUser } from "../users"

// > save user message, schedule streaming response
export const send = mutation({
  args: {
    chatId: v.id("chats"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error("User not authenticated")
    }

    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    if (chat.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    const agent = createAgent(chat.config)

    const { messageId } = await agent.saveMessage(ctx, {
      threadId: chat.threadId,
      prompt: args.prompt,
      skipEmbeddings: true,
    })

    await ctx.scheduler.runAfter(0, internal.chat.message.streamAsync, {
      userSubject: user.subject,
      threadId: chat.threadId,
      promptMessageId: messageId,
      userId: user._id,
      config: chat.config,
    })
  },
})

export const streamAsync = internalAction({
  args: {
    userSubject: v.string(),
    userId: v.string(),
    threadId: v.string(),
    promptMessageId: v.string(),

    config: v.object({
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxOutputTokens: v.optional(v.number()),
      name: v.string(),
    }),
  },
  handler: async (ctx, { promptMessageId, threadId, userSubject, config }) => {
    const stackUser = await stackServerApp.getUser(userSubject)
    if (!stackUser) {
      throw new ConvexError({
        message: "User not found",
      })
    }

    const openrouterApiKey = stackUser.serverMetadata?.openrouterApiKey
    if (!openrouterApiKey) {
      throw new ConvexError({
        message: "OpenRouter API key not found",
      })
    }

    const openrouter = createOpenRouter({
      apiKey: openrouterApiKey,
      compatibility: "strict",
      extraBody: {
        usage: {
          include: true,
        },
        provider: {
          data_collection: "allow",
        },
      },
    })

    const agent = createAgent(config)

    const result = await agent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId,
        model: openrouter.chat(config.modelId),
      },
      // more custom delta options (`true` uses defaults)
      { saveStreamDeltas: true }
    )
    // We need to make sure the stream finishes - by awaiting each chunk
    // or using this call to consume it all.
    await result.consumeStream()
  },
})

export const delete_ = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error("User not authenticated")
    }

    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    if (chat.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    const agent = createAgent(chat.config)
    await agent.deleteMessage(ctx, { messageId: args.messageId })
  },
})
