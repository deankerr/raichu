import { useAtom, useAtomValue } from "jotai"
import { MessagesSquareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useChats } from "../chat/use-chat"
import { useWorkspace } from "../workspace"
import {
  activeTabAtomAtom,
  readActiveTabAtom,
  tabsIndexMapAtom,
  workspaceTabsAtom,
} from "../workspace2/provider"
import { Workspace2 } from "../workspace2/workspace2"

export function ThreadExplorer({ children, className, ...props }: React.ComponentProps<"div">) {
  const chats = useChats()
  const workspace = useWorkspace()
  const [workspaceTabAtoms, dispatch] = useAtom(workspaceTabsAtom)
  const [activeTabAtom, setActiveTabAtom] = useAtom(activeTabAtomAtom)
  const tabIndexMap = useAtomValue(tabsIndexMapAtom)
  const activeWorkspaceTab = useAtomValue(readActiveTabAtom)

  console.log(workspaceTabAtoms.map((a) => a.toString()))
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
        const isOpen = tabIndexMap.get(chat._id)

        return (
          <ThreadButton
            isActive={activeWorkspaceTab?.chatId === chat._id}
            key={chat._id}
            onClick={() => {
              if (isOpen) {
                const tabAtom = tabIndexMap.get(chat._id)
                if (tabAtom) {
                  setActiveTabAtom(tabAtom)
                } else {
                  console.warn("tab atom not found")
                }
              } else {
                dispatch({
                  type: "insert",
                  value: {
                    instanceId: crypto.randomUUID(),
                    chatId: chat._id,
                    title: chat.title,
                  },
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
