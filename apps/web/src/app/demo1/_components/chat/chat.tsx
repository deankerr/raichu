import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useAtom, useSetAtom } from "jotai"
import { PanelRightCloseIcon, PanelRightOpenIcon, ShareIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/utils"
import { useWorkspaceContext } from "../provider"
import { Workspace } from "../workspace"
import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { ChatTitleBar } from "./chat-titlebar"
import { chatParamsSidebarOpenAtom } from "./store"
import { useChat, useChatInputAtoms } from "./use-chat"

function ParamsSidebarToggle() {
  const [isOpen, setOpen] = useAtom(chatParamsSidebarOpenAtom)
  return (
    <Button onClick={() => setOpen(!isOpen)} size="icon-sm" variant="ghost">
      {isOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
      <span className="sr-only">{isOpen ? "Hide sidebar" : "Show sidebar"}</span>
    </Button>
  )
}

export function Chat({ instanceId, chatId }: { instanceId: string; chatId: Id<"chats_v0"> }) {
  const [isParamsSidebarOpen] = useAtom(chatParamsSidebarOpenAtom)

  const { controls } = useWorkspaceContext()

  const deleteChat = useMutation(api.v0.chats.del)
  const chat = useChat(chatId)

  const [chatInputAtoms] = useChatInputAtoms(chatId)
  const setInput = useSetAtom(chatInputAtoms.input)

  const sendMessage = useMutation(api.v0.messages.send)

  const handleSubmit = async (message: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const messageText = message.text?.trim()

    if (!messageText) {
      return
    }

    try {
      await sendMessage({
        chatId,
        content: messageText,
      })
      setInput("")
    } catch (error) {
      console.error(error)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Workspace.Stack>
      <ChatTitleBar>
        <div />
        <div className="text-center">{chat?.title ?? "Chat"}</div>
        <div className="text-right">
          <ParamsSidebarToggle />

          {/* <Button onClick={() => console.log({ thread, messages })} size="icon-sm" variant="ghost">
            <CodeIcon />
          </Button> */}

          <Button asChild disabled={!chat?._id} size="icon-sm" title="Share thread" variant="ghost">
            <a href={`/share/${chatId}`} rel="noopener noreferrer" target="_blank">
              <ShareIcon />
            </a>
          </Button>

          <Button
            onClick={() => {
              if (!chat) {
                return
              }
              deleteChat({ id: chat._id })
              controls.removeTab(instanceId)
            }}
            size="icon-sm"
            variant="ghost"
          >
            <TrashIcon />
          </Button>
        </div>
      </ChatTitleBar>

      {chat && (
        <Workspace.Group>
          <ChatConversation chatId={chat._id}>
            <ChatInput instanceId={chatId} onSubmit={handleSubmit} />
          </ChatConversation>

          <Workspace.CollapsiblePanel isCollapsed={!isParamsSidebarOpen}>
            <Workspace.Stack>
              (prompt/param options panel)
              {/* TODO: temperature, max tokens, system prompt, agent name, etc. */}
            </Workspace.Stack>
          </Workspace.CollapsiblePanel>
        </Workspace.Group>
      )}
    </Workspace.Stack>
  )
}
