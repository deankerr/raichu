import { UserButton } from "@stackframe/stack"
import { OpenRouterMenu } from "@/components/openrouter-menu"
import { cn } from "@/lib/utils"

export function UserPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center justify-between gap-1.5 border-t p-1.5",
        className
      )}
      {...props}
    >
      <div className="grid size-8 place-content-center overflow-hidden rounded-full border-2">
        <UserButton />
      </div>
      <OpenRouterMenu />
    </div>
  )
}
