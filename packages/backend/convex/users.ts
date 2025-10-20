import type { UserIdentity } from "convex/server"
import { ConvexError } from "convex/values"
import type { MutationCtx, QueryCtx } from "./_generated/server"

async function createCurrentUser(ctx: MutationCtx, { auth }: { auth: UserIdentity }) {
  await ctx.db.insert("users", {
    tokenIdentifier: auth.tokenIdentifier,
  })

  const user = (await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", auth.tokenIdentifier))
    .unique())!

  return { ...auth, ...user }
}

export async function getCurrentUser(ctx: QueryCtx) {
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

export async function getOrCreateCurrentUser(ctx: MutationCtx) {
  const currentUser = await getCurrentUser(ctx)
  if (currentUser) {
    return currentUser
  }

  const auth = await ctx.auth.getUserIdentity()
  if (!auth) {
    throw new ConvexError("Not logged in")
  }

  return await createCurrentUser(ctx, { auth })
}
