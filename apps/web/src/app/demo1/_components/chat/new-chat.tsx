import { api } from "@raichu/backend/convex/_generated/api"
import { useMutation } from "convex/react"
import { useSetAtom } from "jotai"
import { toast } from "sonner"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { getErrorMessage } from "@/lib/utils"
import { useWorkspaceContext } from "../provider"
import { Workspace } from "../workspace"
import { ChatInput } from "./chat-input"
import { ChatTitleBar } from "./chat-titlebar"
import { useChatInputAtoms } from "./use-chat"

export function NewChat({ instanceId }: { instanceId: string }) {
  const createChat = useMutation(api.v0.chats.create)
  const sendMessage = useMutation(api.v0.messages.send)
  const { controls } = useWorkspaceContext()

  const [chatInputAtoms] = useChatInputAtoms(instanceId)
  const setInput = useSetAtom(chatInputAtoms.input)

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
      setInput("")
      controls.updateTab(instanceId, {
        componentType: "chat",
        componentId: chatId,
      })
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Workspace.Stack>
      <ChatTitleBar>
        <div />
        <div className="text-center">New Chat</div>
        <div />
      </ChatTitleBar>

      <div className="flex flex-1 items-center *:w-full">
        <ChatInput instanceId={instanceId} onSubmit={handleSubmit} />
      </div>
    </Workspace.Stack>
  )
}
