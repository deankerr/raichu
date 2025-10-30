import { components } from "./_generated/api"
import { internalMutation } from "./_generated/server"

export const wipeAllChatData = internalMutation({
  handler: async (ctx) => {
    const chats = await ctx.db.query("chats").collect()
    for (const chat of chats) {
      await ctx.db.delete(chat._id)
      await ctx.runMutation(components.agent.threads.deleteAllForThreadIdAsync, {
        threadId: chat.threadId,
      })
    }
  },
})
