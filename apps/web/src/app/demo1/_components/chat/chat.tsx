import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useAtom } from "jotai"
import { PanelRightCloseIcon, PanelRightOpenIcon, ShareIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "../workspace"
import { Workspace2 } from "../workspace2/workspace2"
import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { chatParamsSidebarOpenAtom } from "./store"
import { useChat } from "./use-chat"

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
  const deleteChat = useMutation(api.v0.chats.del)

  const chat = useChat(chatId)

  const workspace = useWorkspace()
  // TODO: temporary workspace/threads glue
  const tab = workspace.getTab(instanceId)!

  const onThreadCreated = (newThreadId: string) => {
    workspace.dispatch({
      type: "UPDATE_TAB_PROPS",
      instanceId,
      props: { threadId: newThreadId },
    })
  }

  const [isParamsSidebarOpen] = useAtom(chatParamsSidebarOpenAtom)
  return (
    <Workspace2.Stack>
      <div className="grid h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center overflow-hidden px-1 text-muted-foreground text-xs shadow-md">
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
                instanceId: tab.instanceId,
              })
            }}
            size="icon-sm"
            variant="ghost"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      {chat && (
        <Workspace2.Group>
          <ChatConversation chatId={chat._id} threadId={chat.threadId}>
            <ChatInput chatId={chat._id} onChatCreated={onThreadCreated} />
          </ChatConversation>

          <Workspace2.CollapsiblePanel isCollapsed={!isParamsSidebarOpen}>
            <Workspace2.Stack>(prompt/param options panel)</Workspace2.Stack>
          </Workspace2.CollapsiblePanel>
        </Workspace2.Group>
      )}

      {chatId === "new" && (
        <div className="flex flex-1 items-center *:w-full">
          <ChatInput chatId={chatId as Id<"chats_v0">} onChatCreated={onThreadCreated} />
        </div>
      )}
    </Workspace2.Stack>
  )
}
