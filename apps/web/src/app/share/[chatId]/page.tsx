"use client"

import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { notFound } from "next/navigation"
import { use } from "react"
import { ChatMessage } from "@/app/(main)/app/_components/chat/chat-message"
import { Loader } from "@/components/ai-elements/loader"
import { Spinner } from "@/components/ui/spinner"

export default function Page({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params)
  const chat = useQuery(api.v0.chats.get, { id: chatId })
  const messages = useUIMessages(
    api.v0.messages.list,
    chat?.threadId ? { threadId: chat.threadId } : "skip",
    {
      initialNumItems: 25,
      stream: true,
    }
  )

  if (chat === null) {
    notFound()
  }

  if (chat === undefined) {
    return (
      <div className="grid min-h-screen place-content-center bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4.5 py-8">
        <div className="mx-auto mb-6 max-w-3xl space-y-1">
          <h1 className="font-semibold text-2xl">{chat.label}</h1>
          <p className="flex items-center gap-1 text-muted-foreground text-sm">
            # {/** biome-ignore lint/performance/useTopLevelRegex: please */}
            {new Date(chat._creationTime).toString().replace(/\(.+/, "")}
          </p>
        </div>

        <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-6">
          {messages.status === "LoadingFirstPage" && (
            <div className="grid flex-1 place-content-center">
              <Loader />
            </div>
          )}

          {messages.results.map((message) => (
            <ChatMessage
              isLatestMessage={message.id === messages.results.at(-1)?.id}
              key={message.id}
              message={message}
              showActions={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
