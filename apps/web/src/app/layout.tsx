import "../globals.css"
import { StackProvider, StackTheme } from "@stackframe/stack"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import ClientProviders from "@/app/client-providers"
import Header from "@/components/header"
import { addEnvPrefix } from "@/lib/utils"
import { stackClientApp } from "../stack/client"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: addEnvPrefix("raichu - %s"),
    default: addEnvPrefix("raichu"),
  },
  description: "raichu",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <ClientProviders>
              <Header />
              {children}
            </ClientProviders>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}
