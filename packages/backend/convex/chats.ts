import { query } from "./_generated/server"
import { getCurrentUser } from "./users"

export const list = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      return []
    }

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()
    return chats
  },
})
