import { StackServerApp } from "@stackframe/stack"
import { ConvexError } from "convex/values"
import z from "zod"

// Polyfill performance.now for Convex environment
if (typeof globalThis.performance === "undefined") {
  globalThis.performance = {
    now: () => Date.now(),
  } as unknown as typeof globalThis.performance
} else if (typeof globalThis.performance.now === "undefined") {
  globalThis.performance.now = () => Date.now()
}

export const stackServerApp = new StackServerApp({
  projectId: process.env.STACK_PROJECT_ID as string,
  publishableClientKey: process.env.STACK_PUBLISHABLE_CLIENT_KEY as string,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY as string,
  tokenStore: "memory",
})

export async function getUserOpenRouterApiKey(args: { subject: string }) {
  const stackUser = await stackServerApp.getUser(args.subject)
  if (!stackUser) {
    throw new ConvexError({
      message: "Stack Auth: User not found.",
      subject: args.subject,
    })
  }

  const openrouterApiKey = stackUser.serverMetadata?.openrouterApiKey
  if (!openrouterApiKey) {
    throw new ConvexError({
      message: "Stack Auth: OpenRouter API key not found.",
      subject: args.subject,
    })
  }

  return openrouterApiKey
}

const OpenRouterKeySchema = z.string().min(32).max(128).startsWith("sk-or-v1-")

export async function storeUserOpenRouterApiKey(args: { subject: string; key: string }) {
  const stackUser = await stackServerApp.getUser(args.subject)
  if (!stackUser) {
    throw new ConvexError({
      message: "Stack Auth: User not found.",
      subject: args.subject,
    })
  }

  const parsed = OpenRouterKeySchema.safeParse(args.key)
  if (!parsed.success) {
    throw new ConvexError({
      message: "Invalid OpenRouter key",
      issues: z.flattenError(parsed.error),
      subject: args.subject,
    })
  }

  const timestamp = Date.now()
  const key = parsed.data
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
}
