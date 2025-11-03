import { api } from "@raichu/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { createContext, useContext } from "react"
import { type ChatAtomValue, useChatResourceAtom } from "./store"

function useChatFromList(chatId?: string) {
  const chats = useQuery(api.v0.chats.list)
  return chats?.find((c) => c._id === chatId)
}

const ChatContext = createContext<ChatAtomValue | null>(null)

export function ChatProvider({
  viewId,
  resourceId,
  children,
}: {
  viewId: string
  resourceId?: string
  children: React.ReactNode
}) {
  // NOTE: chat must be already loaded in order to render the provider
  const chat = useChatFromList(resourceId)
  const resourceKey = resourceId ?? viewId

  const [chatData] = useChatResourceAtom({ resourceKey, chat })

  return <ChatContext.Provider value={chatData}>{children}</ChatContext.Provider>
}

export function useChat() {
  const chatData = useContext(ChatContext)
  if (!chatData) {
    throw new Error("useChat must be used within a ChatProvider")
  }

  return chatData
}
