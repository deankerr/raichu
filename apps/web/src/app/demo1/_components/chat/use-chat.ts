import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import { usePaginatedQuery, useQuery } from "convex/react"

export function useThreads() {
  return usePaginatedQuery(api.chat.threads.list, {}, { initialNumItems: 20 })
}

export function useThread(threadId: string) {
  const thread = useQuery(api.chat.thread.get, threadId === "new" ? "skip" : { threadId })

  const messages = useUIMessages(
    api.chat.messages.list,
    threadId === "new" ? "skip" : { threadId },
    { initialNumItems: 10, stream: true }
  )

  return { thread, messages }
}
