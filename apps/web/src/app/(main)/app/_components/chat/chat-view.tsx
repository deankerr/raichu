import { useAtomValue } from "jotai"
import { cn } from "@/lib/utils"
import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { ChatSettings } from "./chat-settings"
import { ChatTitleBar } from "./chat-titlebar"
import { ChatProvider } from "./provider"
import { chatSidebarVisibleAtom } from "./store"

function ChatSidebar({ className, children }: React.ComponentProps<"div">) {
  const isVisible = useAtomValue(chatSidebarVisibleAtom)
  return (
    <div
      className={cn(
        "grid w-72 overflow-hidden transition-[width] duration-200 ease-out",
        className,
        isVisible ? "border-l" : "pointer-events-none w-0"
      )}
    >
      {children}
    </div>
  )
}

export function ChatView({ viewId, resourceId }: { viewId: string; resourceId?: string }) {
  return (
    <ChatProvider resourceId={resourceId} viewId={viewId}>
      <div className="flex overflow-hidden">
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <ChatTitleBar />
          <ChatConversation>
            <ChatInput />
          </ChatConversation>
        </div>

        <ChatSidebar>
          <ChatSettings />
        </ChatSidebar>
      </div>
    </ChatProvider>
  )
}
