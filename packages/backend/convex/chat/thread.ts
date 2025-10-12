import { v } from "convex/values"
import { components } from "../_generated/api"
import { mutation, query } from "../_generated/server"
import { basicAgent } from "../agent"
import { MAX_TITLE_LENGTH, USER_ID } from "../constants"

export const create = mutation({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, { prompt }) =>
    await basicAgent.createThread(ctx, {
      userId: USER_ID,
      title: prompt.slice(0, MAX_TITLE_LENGTH) + (prompt.length > MAX_TITLE_LENGTH ? "..." : ""),
    }),
})

export const delete_ = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    console.log("deleteThread", { threadId })
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
