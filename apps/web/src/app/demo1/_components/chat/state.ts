import { useUIMessages } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { toast } from "sonner"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { getErrorMessage } from "@/lib/utils"
import { validateMessage } from "./utils"

/* ************************************************************************** *
 * Remote Data Hooks (query backend)
 * ************************************************************************** */

export function useThread(threadId?: string) {
  const messages = useUIMessages(api.v0.messages.list, threadId ? { threadId } : "skip", {
    initialNumItems: 25,
    stream: true,
  })

  return { messages }
}

export function useChat(chatId: string) {
  const chats = useQuery(api.v0.chats.list)
  return chats?.find((c) => c._id === chatId)
}

/* ************************************************************************** *
 * Local Tab State (atom family for per-tab state)
 * ************************************************************************** */

export const tabLocalStateFamily = atomFamily(
  ({ id, modelId, input }: { id: string; modelId?: string; input?: string }) =>
    atom({
      id,
      modelId: atom(modelId),
      input: atom(input),
      sidebarOpen: atom(false),
    }),
  (a, b) => a.id === b.id
)

export function useTabLocalState(stateKey: string) {
  return useAtom(tabLocalStateFamily({ id: stateKey }))
}

export function useClearInput(stateKey: string) {
  const [tabState] = useTabLocalState(stateKey)
  const setInput = useAtom(tabState.input)[1]
  return () => setInput("")
}

export function cleanupTabLocalState(stateKey: string) {
  tabLocalStateFamily.remove({ id: stateKey })
}

/* ************************************************************************** *
 * Message Sending (shared logic)
 * ************************************************************************** */

export function useSendMessage(args: {
  stateKey: string
  chatId?: Id<"chats_v0">
  onSuccess?: (result: { chatId: Id<"chats_v0"> }) => void
}) {
  const clearInput = useClearInput(args.stateKey)
  const createChat = useMutation(api.v0.chats.create)
  const sendMessage = useMutation(api.v0.messages.send)

  const handleSubmit = async (message: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const messageText = validateMessage(message)
    if (!messageText) {
      return
    }

    try {
      let chatId = args.chatId

      /* Create new chat if needed */
      if (!chatId) {
        const result = await createChat({})
        chatId = result.chatId
      }

      /* Send the message */
      await sendMessage({
        chatId,
        content: messageText,
      })

      clearInput()

      /* Call success callback if chat was just created */
      if (args.onSuccess && !args.chatId) {
        args.onSuccess({ chatId })
      }
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error))
    }
  }

  return handleSubmit
}
