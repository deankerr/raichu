"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { Provider as JotaiProvider } from "jotai"
import { ThemeProvider } from "next-themes"
import { Toaster } from "./ui/sonner"

// biome-ignore lint/style/noNonNullAssertion: a
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <JotaiProvider>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </JotaiProvider>
      <Toaster richColors />
    </ThemeProvider>
  )
}
