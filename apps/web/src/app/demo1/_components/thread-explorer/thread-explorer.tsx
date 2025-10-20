import { MessagesSquareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useChats } from "../chat/use-chat"
import { useWorkspace } from "../workspace"
import { Workspace2 } from "../workspace2/workspace2"

export function ThreadExplorer({ children, className, ...props }: React.ComponentProps<"div">) {
  const chats = useChats()
  const workspace = useWorkspace()

  return (
    <Workspace2.Stack className={cn("gap-2 px-2 py-2", className)} {...props}>
      {!chats && (
        <div className="grid flex-1 place-content-center text-muted-foreground">
          <Spinner />
        </div>
      )}

      {chats && chats.length === 0 && (
        <div className="grid flex-1 place-content-center text-muted-foreground opacity-50">
          <MessagesSquareIcon />
        </div>
      )}

      {chats?.map((chat) => {
        const threadTab = workspace.state.tabs.main.find(
          (t) => t.componentId === "chat" && t.props?.chatId === chat._id
        )
        const isOpen = !!threadTab
        const isActive = isOpen && workspace.state.activeTabIds.main === threadTab.instanceId

        return (
          <ThreadButton
            isActive={isActive}
            key={chat._id}
            onClick={() => {
              if (isOpen) {
                workspace.dispatch({
                  type: "FOCUS_TAB",
                  instanceId: threadTab.instanceId,
                })
              } else {
                workspace.dispatch({
                  type: "ADD_TAB",
                  componentId: "chat",
                  area: "main",
                  tab: { props: { chatId: chat._id }, title: chat.title },
                })
              }
            }}
          >
            {chat.title || "Untitled Thread"}
          </ThreadButton>
        )
      })}
    </Workspace2.Stack>
  )
}

export function ThreadButton({
  isActive,
  children,
  className,
  ...props
}: { isActive?: boolean } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "block justify-start truncate px-2 text-left",
        isActive && "bg-accent text-accent-foreground dark:bg-accent/50",
        className
      )}
      size="sm"
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  )
}
