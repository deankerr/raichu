import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { useAtom } from "jotai"
import { chatInputAtomFamily } from "./store"

export function useThread(threadId?: string) {
  const messages = useUIMessages(api.v0.messages.list, threadId ? { threadId } : "skip", {
    initialNumItems: 25,
    stream: true,
  })

  return { messages }
}

export function useChats() {
  return useQuery(api.v0.chats.list)
}

export function useChat(chatId: string) {
  const chats = useChats()
  return chats?.find((c) => c._id === chatId)
}

export function useChatInputAtoms(id: string) {
  return useAtom(chatInputAtomFamily({ id }))
}
