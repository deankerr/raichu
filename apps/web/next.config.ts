import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  typedRoutes: true,
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: ["shiki"],
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

export default withBundleAnalyzer(nextConfig)
