import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  typedRoutes: true,
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: ["shiki"],

  // posthog proxy
  rewrites: async () => [
    {
      source: "/snarf/static/:path*",
      destination: "https://us-assets.i.posthog.com/static/:path*",
    },
    {
      source: "/snarf/:path*",
      destination: "https://us.i.posthog.com/:path*",
    },
  ],
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

export default withBundleAnalyzer(nextConfig)
