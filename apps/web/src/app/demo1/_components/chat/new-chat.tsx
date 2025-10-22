import { api } from "@raichu/backend/convex/_generated/api"
import { useMutation } from "convex/react"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { Workspace2 } from "../workspace2/workspace2"
import { ChatInput } from "./chat-input"
import { ChatTitleBar } from "./chat-titlebar"

export function NewChat({ instanceId }: { instanceId: string }) {
  const createChat = useMutation(api.v0.chats.create)
  const sendMessage = useMutation(api.v0.messages.send)

  const handleSubmit = async (message: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const messageText = message.text?.trim()
    if (!messageText) {
      return
    }

    try {
      const { chatId } = await createChat({})
      await sendMessage({
        chatId,
        content: messageText,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Workspace2.Stack>
      <ChatTitleBar>
        <div />
        <div className="text-center">New Chat</div>
        <div />
      </ChatTitleBar>

      <div className="flex flex-1 items-center *:w-full">
        <ChatInput instanceId={instanceId} onSubmit={handleSubmit} />
      </div>
    </Workspace2.Stack>
  )
}
