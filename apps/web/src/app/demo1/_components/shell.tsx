import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Shell({ className, children, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("flex overflow-hidden rounded-md border bg-background", className)}
      data-slot="shell"
      {...props}
    >
      {children}
    </main>
  )
}

export function ShellSidePanel({
  className,
  children,
  isOpen,
  ...props
}: React.ComponentProps<"div"> & { isOpen?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-out",
        isOpen ? "w-64 first:border-r last:border-l" : "pointer-events-none w-0"
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
    </div>
  )
}

export function ShellDock({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grow grid-rows-[2.75rem_1fr] overflow-x-hidden", className)}
      data-slot="shell-dock"
      {...props}
    >
      {children}
    </div>
  )
}

export function ShellDockTabBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-stretch gap-1 overflow-hidden border-b p-1", className)}
      data-slot="shell-dock-tab-bar"
      {...props}
    />
  )
}

export function ShellDockContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid overflow-hidden", className)}
      data-slot="shell-dock-content"
      {...props}
    />
  )
}

export function ShellDockTabButton({
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
        "group flex min-w-0 max-w-60 flex-1 items-center rounded-sm border py-1 pr-1 pl-2.5 text-sm",
        isActive
          ? "bg-accent text-accent-foreground dark:bg-accent/50"
          : "bg-background hover:bg-muted",
        className
      )}
      data-slot="shell-dock-tab-button"
      {...props}
    >
      <button className="min-w-0 flex-1 truncate text-left" onClick={onClick} type="button">
        {label}
      </button>
      <button
        aria-label="Close tab"
        className={cn(
          "hidden flex-shrink-0 rounded p-1 transition-opacity hover:bg-muted-foreground/20 group-hover:block",
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

export function ShellDockTabIconButton({
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
