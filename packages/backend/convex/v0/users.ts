import { ConvexError, v } from "convex/values"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { action } from "../_generated/server"
import { storeUserOpenRouterApiKey } from "./lib/auth"

async function createAuthorizedUser(ctx: MutationCtx) {
  const auth = await ctx.auth.getUserIdentity()

  if (!auth) {
    throw new ConvexError({ message: "Not authorized." })
  }

  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", auth.tokenIdentifier))
    .first()

  if (existingUser) {
    throw new ConvexError({ message: "tokenIdentifier already in use." })
  }

  const userId = await ctx.db.insert("users", {
    updatedAt: Date.now(),
    tokenIdentifier: auth.tokenIdentifier,
  })

  const user = (await ctx.db.get(userId))!

  return { ...auth, ...user }
}

export async function getAuthorizedUser(ctx: QueryCtx) {
  const auth = await ctx.auth.getUserIdentity()
  if (!auth) {
    return null
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", auth.tokenIdentifier))
    .first()

  if (!user) {
    return null
  }

  return { ...auth, ...user }
}

export async function getAuthorizedUserOrThrow(ctx: QueryCtx) {
  const user = await getAuthorizedUser(ctx)
  if (!user) {
    throw new ConvexError("Not authorized.")
  }

  return user
}

export async function getOrCreateAuthorizedUser(ctx: MutationCtx) {
  const user = await getAuthorizedUser(ctx)
  if (user) {
    return user
  }

  const newUser = await createAuthorizedUser(ctx)
  return newUser
}

export const storeOpenRouterApiKey = action({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await ctx.auth.getUserIdentity()
    if (!auth) {
      throw new ConvexError("User not authenticated")
    }

    await storeUserOpenRouterApiKey({ subject: auth.subject, key: args.key })
  },
})
