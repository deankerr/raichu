import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "demo1",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
