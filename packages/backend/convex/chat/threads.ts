import { paginationOptsValidator } from "convex/server"
import { components } from "../_generated/api"
import { query } from "../_generated/server"
import { USER_ID } from "../constants"

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const threads = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId: USER_ID,
      paginationOpts,
    })
    return threads
  },
})
