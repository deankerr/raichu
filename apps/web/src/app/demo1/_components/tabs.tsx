import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabButton({
  label,
  isActive,
  onClose,
  onClick,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  label: string
  isActive?: boolean
  onClose?: () => void
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        "group flex min-w-0 max-w-60 flex-1 rounded-sm border text-[13px]",
        isActive
          ? "bg-accent text-accent-foreground dark:bg-accent/50"
          : "bg-background hover:bg-muted",
        className
      )}
      data-slot="shell-dock-tab-button"
      {...props}
    >
      <button
        className={cn(
          "min-w-0 flex-1 truncate py-1 pr-2 pl-2 text-left group-hover:pr-0",
          isActive && "pr-0"
        )}
        onClick={onClick}
        type="button"
      >
        {label}
      </button>
      <button
        aria-label="Close tab"
        className={cn(
          "mr-1 hidden flex-shrink-0 self-center rounded p-1 transition-opacity hover:bg-muted-foreground/20 group-hover:block",
          isActive && "block"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onClose?.()
        }}
        type="button"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

export function TabIconButton({
  label,
  isActive = false,
  children,
  onClick,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  label: string
  isActive?: boolean
}) {
  return (
    <button
      className={cn(
        "group flex shrink-0 items-center rounded-sm border px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        isActive
          ? "bg-accent text-accent-foreground dark:bg-accent/50"
          : "bg-background hover:bg-muted",
        className
      )}
      data-slot="shell-dock-tab-icon-button"
      onClick={onClick}
      title={label}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
