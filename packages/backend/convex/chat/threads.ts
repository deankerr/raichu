import { paginationOptsValidator } from "convex/server"
import { components } from "../_generated/api"
import { query } from "../_generated/server"
import { emptyPaginatedResult } from "../utils"

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      return emptyPaginatedResult()
    }

    const threads = await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId: userData.tokenIdentifier,
      paginationOpts,
    })
    return threads
  },
})
