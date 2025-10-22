export function ChatTitleBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center overflow-hidden px-1 text-muted-foreground text-xs shadow-md">
      {children}
    </div>
  )
}
