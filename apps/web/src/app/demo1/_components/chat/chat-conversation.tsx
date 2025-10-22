import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Loader } from "@/components/ai-elements/loader"
import { ChatMessage } from "./chat-message"
import { useChat, useThread } from "./use-chat"

export function ChatConversation({
  chatId,
  children,
}: {
  chatId: Id<"chats_v0">
  children?: React.ReactNode
}) {
  const chat = useChat(chatId)
  const { messages } = useThread(chat?.threadId)

  return (
    <Conversation className="flex flex-col overflow-hidden" initial="instant" resize="instant">
      <ConversationContent className="mx-auto flex min-h-full max-w-3xl flex-col px-4.5">
        {messages.results.length === 0 && !messages.isLoading && (
          <ConversationEmptyState className="flex-1" />
        )}

        {messages.status === "LoadingFirstPage" && (
          <div className="grid flex-1 place-content-center">
            <Loader />
          </div>
        )}

        {messages.results.map((message) => (
          <ChatMessage
            chatId={chatId}
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
