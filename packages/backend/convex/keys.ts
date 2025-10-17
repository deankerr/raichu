import { ConvexError, v } from "convex/values"
import { z } from "zod"
import { action } from "./_generated/server"
import { stackServerApp } from "./lib/stack"

const KEY_MIN_LENGTH = 32
const KEY_MAX_LENGTH = 128

const OpenRouterKeySchema = z
  .string()
  .min(KEY_MIN_LENGTH)
  .max(KEY_MAX_LENGTH)
  .startsWith("sk-or-v1-")

export const store = action({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userData = await ctx.auth.getUserIdentity()
    if (!userData) {
      throw new ConvexError("User not authenticated")
    }

    const stackUser = await stackServerApp.getUser(userData.subject)
    if (!stackUser) {
      throw new ConvexError("User not found")
    }

    const parsed = OpenRouterKeySchema.safeParse(args.key)
    if (!parsed.success) {
      throw new ConvexError({
        message: "Invalid OpenRouter key",
        issues: z.flattenError(parsed.error),
      })
    }

    const timestamp = Date.now()
    const key = parsed.data
    // biome-ignore lint/style/noMagicNumbers: this is how OR signatures are formatted
    const signature = `${key.slice(0, 9)}…${key.slice(-3)}`

    await stackUser.update({
      serverMetadata: {
        openrouterApiKey: key,
        openrouterApiKeyUpdatedAt: timestamp,
      },
      clientReadOnlyMetadata: {
        openrouterApiKeySignature: signature,
        openrouterApiKeyUpdatedAt: timestamp,
      },
    })

    console.log("stored key for user", stackUser.id)
  },
})
