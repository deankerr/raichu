"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { Provider as JotaiProvider } from "jotai"
import { ThemeProvider } from "next-themes"
import { stackClientApp } from "@/stack/client"
import { Toaster } from "../components/ui/sonner"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
convex.setAuth(stackClientApp.getConvexClientAuth({}))

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <JotaiProvider>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </JotaiProvider>
      <Toaster richColors />
    </ThemeProvider>
  )
}
