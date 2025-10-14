import { api } from "@raichu/backend/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ threadId: string }>
}): Promise<Metadata> {
  const { threadId } = await params

  // biome-ignore lint/style/noNonNullAssertion: a
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  const thread = await convex.query(api.chat.thread.get, { threadId })

  return {
    title: thread?.title,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
