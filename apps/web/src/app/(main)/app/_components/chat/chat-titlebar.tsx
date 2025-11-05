import { useAtom } from "jotai"
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useChat } from "./provider"
import { chatSidebarVisibleAtom } from "./store"

function SidebarToggle() {
  const [isVisible, toggle] = useAtom(chatSidebarVisibleAtom)
  return (
    <Toggle
      aria-label="Toggle sidebar"
      className="group data-[state=on]:bg-transparent data-[state=on]:text-muted-foreground"
      onPressedChange={toggle}
      pressed={isVisible}
      size="sm"
    >
      <PanelRightCloseIcon className="size-3.5 group-data-[state=off]:hidden" />
      <PanelRightOpenIcon className="size-3.5 group-data-[state=on]:hidden" />
    </Toggle>
  )
}

export function ChatTitleBar() {
  const chat = useChat()
  return (
    <div className="grid h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center overflow-hidden px-1 text-muted-foreground text-xs shadow-md">
      <div />
      <div className="text-center">{chat?.label || "Untitled Chat"}</div>
      <div className="text-right">
        <SidebarToggle />
      </div>
    </div>
  )
}
