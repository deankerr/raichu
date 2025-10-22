import { MessagesSquareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useChats } from "../chat/use-chat"
import { useWorkspaceContext } from "../provider"
import { Workspace } from "../workspace"

export function ChatsMenu({ children, className, ...props }: React.ComponentProps<"div">) {
  const chats = useChats()
  const { tabs, activeTab, controls } = useWorkspaceContext()

  return (
    <Workspace.Stack className={cn("gap-2 px-2 py-2", className)} {...props}>
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
        const existingTab = tabs.find(
          (tab) => tab.componentType === "chat" && tab.componentId === chat._id
        )
        const isActive = activeTab?.componentType === "chat" && activeTab.componentId === chat._id

        return (
          <ChatMenuButton
            isActive={isActive}
            key={chat._id}
            onClick={() => {
              if (existingTab) {
                controls.setActiveTab(existingTab.tabId)
              } else {
                controls.addTab({
                  componentType: "chat",
                  componentId: chat._id,
                  title: chat.title || "Untitled",
                })
              }
            }}
          >
            {chat.title || "Untitled Thread"}
          </ChatMenuButton>
        )
      })}
    </Workspace.Stack>
  )
}

export function ChatMenuButton({
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
