"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ThemeProvider } from "next-themes"

import { Toaster } from "./ui/sonner"

// biome-ignore lint/style/noNonNullAssertion: a
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
      <Toaster richColors />
    </ThemeProvider>
  )
}
