import { MessagesSquareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useThreads } from "../chat/use-chat"
import { useWorkspace } from "../workspace"

export function ThreadExplorer({ children, className, ...props }: React.ComponentProps<"div">) {
  const threads = useThreads()
  const workspace = useWorkspace()

  return (
    <div className={cn("flex flex-col gap-2 overflow-x-hidden px-2 py-2", className)} {...props}>
      {threads.isLoading && (
        <div className="grid flex-1 place-content-center text-muted-foreground">
          <Spinner />
        </div>
      )}

      {!threads.isLoading && threads.results.length === 0 && (
        <div className="grid flex-1 place-content-center text-muted-foreground opacity-50">
          <MessagesSquareIcon />
        </div>
      )}

      {threads.results.map((thread) => {
        const threadTab = workspace.state.tabs.main.find(
          (t) => t.componentId === "chat" && t.props?.threadId === thread._id
        )
        const isOpen = !!threadTab
        const isActive = isOpen && workspace.state.activeTabIds.main === threadTab.instanceId

        return (
          <ThreadButton
            isActive={isActive}
            key={thread._id}
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
                  tab: { props: { threadId: thread._id }, title: thread.title },
                })
              }
            }}
          >
            {thread.title || "Untitled Thread"}
          </ThreadButton>
        )
      })}
    </div>
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
