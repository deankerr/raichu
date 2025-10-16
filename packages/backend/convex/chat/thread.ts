import { v } from "convex/values"
import { components } from "../_generated/api"
import { mutation, query } from "../_generated/server"
import { basicAgent } from "../agent"
import { MAX_TITLE_LENGTH } from "../constants"

export const create = mutation({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, { prompt }) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      throw new Error("User not authenticated")
    }

    return await basicAgent.createThread(ctx, {
      userId: userData.tokenIdentifier,
      title: prompt.slice(0, MAX_TITLE_LENGTH) + (prompt.length > MAX_TITLE_LENGTH ? "..." : ""),
    })
  },
})

export const delete_ = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      throw new Error("User not authenticated")
    }

    // TODO: auth check
    await basicAgent.deleteThreadAsync(ctx, { threadId })
  },
})

export const get = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId,
    })
    return thread
  },
})
