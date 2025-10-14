"use client"

import { SparklesIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { use } from "react"
import { ChatMessage } from "@/app/demo1/_components/chat/chat-message"
import { useThread } from "@/app/demo1/_components/chat/use-chat"
import { ConversationEmptyState } from "@/components/ai-elements/conversation"
import { Loader } from "@/components/ai-elements/loader"
import { Spinner } from "@/components/ui/spinner"

export default function Page({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params)
  const { thread, messages } = useThread(threadId)

  if (thread === null) {
    notFound()
  }

  if (thread === undefined) {
    return (
      <div className="grid min-h-screen place-content-center bg-background text-muted-foreground">
        <Spinner />
      </div>
    )
  }

  const isNewChat = threadId === "new"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4.5 py-8">
        <div className="mx-auto mb-6 max-w-3xl space-y-1">
          <h1 className="font-semibold text-2xl">{thread.title}</h1>
          <p className="flex items-center gap-1 text-muted-foreground text-sm">
            <SparklesIcon className="size-3" />
            {/** biome-ignore lint/performance/useTopLevelRegex: please */}
            {new Date(thread._creationTime).toString().replace(/\(.+/, "")}
          </p>
        </div>

        <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-6">
          {isNewChat && <ConversationEmptyState className="flex-1" />}

          {!isNewChat && messages.status === "LoadingFirstPage" && (
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
