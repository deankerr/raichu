import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Spinner } from "@/components/ui/spinner"
import { ChatMessage } from "./chat-message"
import { useChat } from "./provider"

export function ChatConversation({ children }: { children?: React.ReactNode }) {
  const chat = useChat()

  const messages = useUIMessages(
    api.v0.messages.list,
    chat.threadId ? { threadId: chat.threadId } : "skip",
    {
      initialNumItems: 25,
      stream: true,
    }
  )

  const isInitialLoad = messages.status === "LoadingFirstPage" && chat.chatId

  return (
    <Conversation className="flex flex-col overflow-hidden" initial="instant" resize="instant">
      <ConversationContent className="mx-auto flex min-h-full max-w-3xl flex-col px-4.5">
        {!isInitialLoad && messages.results.length === 0 && (
          <ConversationEmptyState className="flex-1" />
        )}

        {isInitialLoad && (
          <div className="grid flex-1 place-content-center">
            <Spinner />
          </div>
        )}

        {messages.results.map((message) => (
          <ChatMessage
            className="py-6"
            isLatestMessage={message.id === messages.results.at(-1)?.id}
            key={message.id}
            message={message}
          />
        ))}

        <div className="flex-1" />

        <div className="sticky bottom-4 mt-8 space-y-6 text-center">
          <ConversationScrollButton className="-top-16" />
          {children}
        </div>
      </ConversationContent>
    </Conversation>
  )
}
