import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useAtom, useSetAtom } from "jotai"
import { PanelRightCloseIcon, PanelRightOpenIcon, ShareIcon, TrashIcon } from "lucide-react"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "../workspace"
import { Workspace2 } from "../workspace2/workspace2"
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

  const deleteChat = useMutation(api.v0.chats.del)
  const chat = useChat(chatId)
  const workspace = useWorkspace()

  const [chatInputAtoms] = useChatInputAtoms(instanceId)
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
    }
  }

  return (
    <Workspace2.Stack>
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
              workspace.dispatch({
                type: "REMOVE_TAB",
                instanceId,
              })
            }}
            size="icon-sm"
            variant="ghost"
          >
            <TrashIcon />
          </Button>
        </div>
      </ChatTitleBar>

      {chat && (
        <Workspace2.Group>
          <ChatConversation chatId={chat._id} threadId={chat.threadId}>
            <ChatInput instanceId={instanceId} onSubmit={handleSubmit} />
          </ChatConversation>

          <Workspace2.CollapsiblePanel isCollapsed={!isParamsSidebarOpen}>
            <Workspace2.Stack>(prompt/param options panel)</Workspace2.Stack>
          </Workspace2.CollapsiblePanel>
        </Workspace2.Group>
      )}
    </Workspace2.Stack>
  )
}
