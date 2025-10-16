import { openrouter } from "@openrouter/ai-sdk-provider"
import { v } from "convex/values"
import { internal } from "../_generated/api"
import { internalAction, mutation } from "../_generated/server"
import { basicAgent } from "../agent"

// > save user message, schedule streaming response
export const send = mutation({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      throw new Error("User not authenticated")
    }
    // TODO: auth check

    const { messageId } = await basicAgent.saveMessage(ctx, {
      threadId: args.threadId,
      prompt: args.prompt,
      skipEmbeddings: true,
    })

    await ctx.scheduler.runAfter(0, internal.chat.message.streamAsync, {
      threadId: args.threadId,
      promptMessageId: messageId,
      modelId: args.modelId,
    })
  },
})

export const streamAsync = internalAction({
  args: {
    promptMessageId: v.string(),
    threadId: v.string(),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { promptMessageId, threadId, modelId }) => {
    const result = await basicAgent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId,
        model: modelId ? openrouter.chat(modelId) : undefined,
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
