import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import { usePaginatedQuery, useQuery } from "convex/react"
import { useAtom } from "jotai"
import { chatInputAtomFamily } from "./store"

export function useThreads() {
  return usePaginatedQuery(api.chat.threads.list, {}, { initialNumItems: 20 })
}

export function useThread(threadId: string) {
  const thread = useQuery(api.chat.thread.get, threadId === "new" ? "skip" : { threadId })

  const messages = useUIMessages(
    api.chat.messages.list,
    threadId === "new" ? "skip" : { threadId },
    { initialNumItems: 25, stream: true }
  )

  return { thread, messages }
}

export function useChatInputAtoms(threadId: string) {
  return useAtom(chatInputAtomFamily({ threadId }))
}
