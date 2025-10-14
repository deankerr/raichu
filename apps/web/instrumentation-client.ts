/** biome-ignore-all lint/style/noNonNullAssertion: z */
import posthog from "posthog-js"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  defaults: "2025-05-24",
  api_host: "/snarf",
})
