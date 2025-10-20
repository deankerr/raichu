import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { useAtom } from "jotai"
import { chatInputAtomFamily } from "./store"

export function useThread(threadId: string) {
  const messages = useUIMessages(
    api.chat.messages.list,
    threadId === "new" ? "skip" : { threadId },
    { initialNumItems: 25, stream: true }
  )

  return { messages }
}

export function useChats() {
  return useQuery(api.chats.list)
}

export function useChat(chatId: string) {
  const chats = useChats()
  return chats?.find((c) => c._id === chatId)
}

export function useChatInputAtoms(chatId: string) {
  return useAtom(chatInputAtomFamily({ chatId }))
}
