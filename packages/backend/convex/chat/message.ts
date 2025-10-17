import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { ConvexError, v } from "convex/values"
import { internal } from "../_generated/api"
import { internalAction, mutation } from "../_generated/server"
import { basicAgent } from "../agent"
import { stackServerApp } from "../lib/stack"

// > save user message, schedule streaming response
export const send = mutation({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      throw new Error("User not authenticated")
    }
    // TODO: check ownership of thread

    const { messageId } = await basicAgent.saveMessage(ctx, {
      threadId: args.threadId,
      prompt: args.prompt,
      skipEmbeddings: true,
    })

    await ctx.scheduler.runAfter(0, internal.chat.message.streamAsync, {
      threadId: args.threadId,
      promptMessageId: messageId,
      modelId: args.modelId,
      userId: userData.subject,
    })
  },
})

export const streamAsync = internalAction({
  args: {
    promptMessageId: v.string(),
    threadId: v.string(),
    modelId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { promptMessageId, threadId, modelId, userId }) => {
    const stackUser = await stackServerApp.getUser(userId)
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

    const result = await basicAgent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId,
        model: openrouter.chat(modelId),
        temperature: 0.6,
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
  args: { messageId: v.string() },
  handler: async (ctx, { messageId }) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      throw new Error("User not authenticated")
    }
    // TODO: auth check

    await basicAgent.deleteMessage(ctx, { messageId })
  },
})
