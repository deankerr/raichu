import { CircleSlash2Icon } from "lucide-react"
import { ChatView } from "./chat/chat-view"
import { ChatsMenu } from "./sidebar/chats-menu"

/**
 * Renders the appropriate view component based on view.kind
 * In the future, this will use a views registry
 */
export function ViewRenderer({
  view,
}: {
  view?: { id: string; kind: string; resourceId: string | undefined; label: string }
}) {
  if (!view) {
    return (
      <div className="grid flex-1 place-content-center text-muted-foreground opacity-50">
        <CircleSlash2Icon />
      </div>
    )
  }
  switch (view.kind) {
    case "chat":
      return <ChatView resourceId={view.resourceId} viewId={view.id} />
    case "chats-menu":
      return <ChatsMenu className="h-full" />
    default:
      return (
        <div className="grid h-full place-content-center text-muted-foreground">
          <p className="text-sm">Unknown view kind: {view.kind}</p>
        </div>
      )
  }
}
