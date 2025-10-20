import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { ConvexHttpClient } from "convex/browser"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}): Promise<Metadata> {
  const { chatId } = await params

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  const thread = await convex.query(api.chat.get, { chatId: chatId as Id<"chats"> })

  return {
    title: thread?.title,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
