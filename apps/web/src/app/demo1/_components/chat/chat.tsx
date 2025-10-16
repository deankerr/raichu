import { api } from "@raichu/backend/convex/_generated/api"
import { useMutation } from "convex/react"
import { CodeIcon, ShareIcon, TrashIcon } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "../workspace"
import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { useThread } from "./use-chat"

type ChatProps = {
  instanceId: string
  threadId: string // Can be "new" for new chat
}

export function Chat({ instanceId, threadId }: ChatProps) {
  const deleteThread = useMutation(api.chat.thread.delete_)
  const { thread, messages } = useThread(threadId)

  const workspace = useWorkspace()

  // TODO: temporary workspace/threads glue
  // biome-ignore lint/style/noNonNullAssertion: ya
  const tab = workspace.getTab(instanceId)!
  const tabTitle = tab.title

  useEffect(() => {
    if (thread?.title && tabTitle !== thread.title) {
      workspace.dispatch({
        type: "UPDATE_TAB_TITLE",
        instanceId,
        title: thread.title,
      })
    }
  }, [tabTitle, thread, instanceId, workspace])

  const onThreadCreated = (newThreadId: string) => {
    workspace.dispatch({
      type: "UPDATE_TAB_PROPS",
      instanceId,
      props: { threadId: newThreadId },
    })
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="grid h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center overflow-hidden px-1 text-muted-foreground text-xs">
        <div />
        <div className="text-center">{tabTitle}</div>
        <div className="text-right">
          <Button onClick={() => console.log({ thread, messages })} size="icon-sm" variant="ghost">
            <CodeIcon />
          </Button>

          {threadId !== "new" && thread && (
            <Button asChild size="icon-sm" title="Share thread" variant="ghost">
              <a href={`/share/${threadId}`} rel="noopener noreferrer" target="_blank">
                <ShareIcon />
              </a>
            </Button>
          )}

          <Button
            onClick={() => {
              deleteThread({ threadId })
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
      <ChatConversation threadId={threadId}>
        <ChatInput onThreadCreated={onThreadCreated} threadId={threadId} />
      </ChatConversation>
    </div>
  )
}
