import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useAtom } from "jotai"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { chatModelIds } from "./data"
import { useChatInputAtoms } from "./use-chat"

type ChatInputProps = {
  chatId: Id<"chats">
  onChatCreated?: (chatId: string) => void
}

export function ChatInput({ chatId, onChatCreated }: ChatInputProps) {
  const [chatAtom] = useChatInputAtoms(chatId)
  const [input, setInput] = useAtom(chatAtom.input)
  const [modelId = chatModelIds[0].value, setModelId] = useAtom(chatAtom.modelId)

  const isNewChat = chatId === "new"

  const createChat = useMutation(api.chat.create)
  const sendMessage = useMutation(api.chat.message.send)

  const handleSubmit = async (message: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.text?.trim()) {
      return
    }

    const messageText = message.text.trim()
    setInput("")

    try {
      const targetChatId = isNewChat
        ? (
            await createChat({
              prompt: messageText,
              modelId,
              name: "NameBot",
            })
          ).chatId
        : chatId

      await sendMessage({
        chatId: targetChatId,
        prompt: messageText,
      })

      if (isNewChat) {
        onChatCreated?.(targetChatId)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-background">
      <PromptInput className="mx-auto max-w-3xl" globalDrop multiple onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            {/* <PromptInputButton
              variant={webSearch ? "default" : "ghost"}
              onClick={() => setWebSearch(!webSearch)}
            >
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton> */}
            <PromptInputModelSelect
              onValueChange={(value) => {
                setModelId(value)
              }}
              value={modelId}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {chatModelIds.map((m) => (
                  <PromptInputModelSelectItem key={m.value} value={m.value}>
                    {m.name ?? m.value}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}
