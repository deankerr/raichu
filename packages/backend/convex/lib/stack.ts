import { StackServerApp } from "@stackframe/stack"

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
