import { query } from "./_generated/server"

export const get = query({
  handler: async () => "OK",
})

export const getUser = query({
  handler: async (ctx) => {
    const userData = await ctx.auth.getUserIdentity()
    return userData
  },
})
