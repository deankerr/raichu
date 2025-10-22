"use client"

import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { SparklesIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { use } from "react"
import { ChatMessage } from "@/app/demo1/_components/chat/chat-message"
import { useChat, useThread } from "@/app/demo1/_components/chat/state"
import { Loader } from "@/components/ai-elements/loader"
import { Spinner } from "@/components/ui/spinner"

export default function Page({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params)
  const chat = useChat(chatId as Id<"chats_v0">)
  const { messages } = useThread(chat?.threadId)

  if (chat === null) {
    notFound()
  }

  if (chat === undefined) {
    return (
      <div className="grid min-h-screen place-content-center bg-background text-muted-foreground">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4.5 py-8">
        <div className="mx-auto mb-6 max-w-3xl space-y-1">
          <h1 className="font-semibold text-2xl">{chat.title}</h1>
          <p className="flex items-center gap-1 text-muted-foreground text-sm">
            <SparklesIcon className="size-3" />
            {/** biome-ignore lint/performance/useTopLevelRegex: please */}
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
              chatId={chatId as Id<"chats_v0">}
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
