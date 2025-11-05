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
  const chat = await convex.query(api.v0.chats.get, { id: chatId as Id<"chats"> })

  return {
    title: chat?.label,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
