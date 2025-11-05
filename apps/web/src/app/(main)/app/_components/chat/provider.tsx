import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { createContext, use, useEffect } from "react"
import { toast } from "sonner"
import { store } from "@/app/store"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { useWorkspace } from "../workspace/workspace"
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

  const [chatData, setChatData] = useChatResourceAtom({ resourceKey, chat })
  const updateView = useWorkspace((state) => state.updateView)

  useEffect(() => {
    const label = chat?.label ?? "Untitled Chat"
    setChatData((prev) => ({ ...prev, label }))
    updateView(viewId, { label })
  }, [chat?.label, setChatData, viewId, updateView])

  return <ChatContext.Provider value={chatData}>{children}</ChatContext.Provider>
}

export function useChat() {
  const chatData = use(ChatContext)
  if (!chatData) {
    throw new Error("useChat must be used within a ChatProvider")
  }

  return chatData
}

export function useSendMessage() {
  const createChat = useMutation(api.v0.chats.create)
  const updateChat = useMutation(api.v0.chats.update)
  const sendMessage = useMutation(api.v0.messages.send)
  const chatData = use(ChatContext)

  return async (input: PromptInputMessage) => {
    if (!chatData) {
      throw new Error("useChat must be used within a ChatProvider")
    }

    const languageModelSettings = store.get(chatData.languageModelSettingsAtom)
    const agentSettings = store.get(chatData.agentSettingsAtom)

    try {
      let chatId: Id<"chats">

      if (chatData.chatId) {
        chatId = chatData.chatId
        await updateChat({ id: chatId, fields: { languageModelSettings, agentSettings } })
      } else {
        const { chatId: newChatId } = await createChat({ languageModelSettings, agentSettings })
        chatId = newChatId
      }

      await sendMessage({ chatId, prompt: input.text ?? "", respond: true })
      store.set(chatData.inputAtom, "")
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message)
    }
  }
}
