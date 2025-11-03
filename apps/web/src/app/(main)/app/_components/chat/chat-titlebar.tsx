import { useChat } from "./provider"

export function ChatTitleBar() {
  const chat = useChat()
  return (
    <div className="grid h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center overflow-hidden px-1 text-muted-foreground text-xs shadow-md">
      <div />
      <div className="text-center">{chat?.label || "Untitled Chat"}</div>
      <div className="text-right" />
    </div>
  )
}
