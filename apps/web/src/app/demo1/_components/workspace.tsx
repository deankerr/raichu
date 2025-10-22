import { cn } from "@/lib/utils"

function Frame({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 overflow-hidden rounded-md border bg-background", className)}
      data-workspace-slot="frame"
      {...props}
    >
      {children}
    </div>
  )
}

function Group({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 overflow-hidden", className)}
      data-workspace-slot="group"
      {...props}
    >
      {children}
    </div>
  )
}

function CollapsiblePanel({
  isCollapsed = false,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { isCollapsed?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-64 shrink-0 overflow-hidden transition-[width] duration-200 ease-out",
        isCollapsed ? "pointer-events-none w-0" : "first:border-r last:border-l",
        className
      )}
      data-workspace-slot="collapsible-panel"
      {...props}
    >
      {children}
    </div>
  )
}

function Panel({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 overflow-hidden", className)}
      data-workspace-slot="panel"
      {...props}
    >
      {children}
    </div>
  )
}

function Row({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex shrink-0 gap-1 overflow-hidden p-1", className)}
      data-workspace-slot="row"
      {...props}
    >
      {children}
    </div>
  )
}

function Stack({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-x-hidden", className)}
      data-workspace-slot="stack"
      {...props}
    >
      {children}
    </div>
  )
}

export const Workspace = { Frame, Group, CollapsiblePanel, Panel, Row, Stack }
