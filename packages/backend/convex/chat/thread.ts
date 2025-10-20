import { components } from "../_generated/api"
import type { MutationCtx, QueryCtx } from "../_generated/server"

/**
 * Helper function to get a thread by ID
 */
export async function getThread(ctx: QueryCtx, args: { threadId: string }) {
  const thread = await ctx.runQuery(components.agent.threads.getThread, {
    threadId: args.threadId,
  })
  return thread
}

/**
 * Helper function to delete a thread and all its messages
 */
export async function deleteThread(ctx: MutationCtx, args: { threadId: string }) {
  // Schedule async deletion of all thread data
  await ctx.scheduler.runAfter(0, components.agent.threads.deleteAllForThreadIdAsync, {
    threadId: args.threadId,
  })
}
