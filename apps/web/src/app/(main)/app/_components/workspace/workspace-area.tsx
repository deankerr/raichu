import { cn } from "@/lib/utils"

export function WorkspaceArea({
  className,
  children,
  isCollapsed,
}: { isCollapsed?: boolean } & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-rows-[2.75rem_1fr] overflow-hidden transition-[width] duration-200 ease-out",
        className,
        isCollapsed ? "pointer-events-none w-0" : "first:border-r"
      )}
    >
      {children}
    </div>
  )
}
