import { useAtom } from "jotai"
import { useKeys } from "rooks"
import { cn } from "@/lib/utils"
import { showViewportDecorationAtom } from "./store"

function SequoiaWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border bg-background [&>main]:flex-1 [&>main]:rounded-none [&>main]:border-none">
      <div className="grid h-7 grid-cols-[1fr_auto_1fr] items-center bg-muted px-2 font-bold text-foreground/70 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-[11.5px] rounded-full bg-red-400/80" />
          <div className="size-[11.5px] rounded-full bg-yellow-400/80" />
          <div className="size-[11.5px] rounded-full bg-green-400/80" />
        </div>
        <div>raichu</div>
        <div />
      </div>

      {children}
    </div>
  )
}

export function Viewport({
  decoration: decorationProp,
  children,
  className,
  ...props
}: {
  decoration?: boolean
} & React.ComponentProps<"div">) {
  const [decoration, setDecoration] = useAtom(showViewportDecorationAtom) || decorationProp

  useKeys(["AltLeft", "KeyV"], () => {
    setDecoration(!decoration)
  })

  return (
    <div className={cn("grid h-svh overflow-hidden bg-black p-5", className)} {...props}>
      {decoration ? <SequoiaWindow>{children}</SequoiaWindow> : children}
    </div>
  )
}
