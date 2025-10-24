import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useAtom, useSetAtom } from "jotai"
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Workspace } from "../workspace"
import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { ChatSettings } from "./chat-settings"
import { ChatTitleBar } from "./chat-titlebar"
import { useChat, useSendMessage, useTabLocalState } from "./state"

export function Chat({
  chatId,
  stateKey,
}: {
  tabId: string
  chatId: Id<"chats_v0">
  stateKey: string
}) {
  const chat = useChat(chatId)

  const [tabState] = useTabLocalState(stateKey)
  const [isSidebarOpen, setSidebarOpen] = useAtom(tabState.sidebarOpen)

  // Get setters for chat settings
  const setModelId = useSetAtom(tabState.modelId)
  const setTemperature = useSetAtom(tabState.temperature)
  const setMaxOutputTokens = useSetAtom(tabState.maxOutputTokens)
  const setInstructions = useSetAtom(tabState.instructions)

  const handleSubmit = useSendMessage({ stateKey, chatId })

  // Sync chat settings with local state when chat is loaded
  useEffect(() => {
    if (!chat) return

    // Update local state with chat settings from the backend
    if (chat.modelId !== undefined) setModelId(chat.modelId)
    if (chat.temperature !== undefined) setTemperature(chat.temperature)
    if (chat.maxOutputTokens !== undefined) setMaxOutputTokens(chat.maxOutputTokens)
    if (chat.instructions !== undefined) setInstructions(chat.instructions)
  }, [chat, setModelId, setTemperature, setMaxOutputTokens, setInstructions])

  return (
    <Workspace.Stack>
      <ChatTitleBar>
        <div />
        <div className="text-center">{chat?.title || "Untitled Chat"}</div>
        <div className="text-right">
          <Button
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            size="icon-sm"
            variant="ghost"
          >
            {isSidebarOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
          </Button>
        </div>
      </ChatTitleBar>

      {chat && (
        <Workspace.Group>
          <ChatConversation chatId={chat._id}>
            <ChatInput onSubmit={handleSubmit} stateKey={stateKey} />
          </ChatConversation>

          <Workspace.CollapsiblePanel className="border-t" isCollapsed={!isSidebarOpen}>
            <Workspace.Stack>
              <ChatSettings stateKey={stateKey} />
            </Workspace.Stack>
          </Workspace.CollapsiblePanel>
        </Workspace.Group>
      )}
    </Workspace.Stack>
  )
}
