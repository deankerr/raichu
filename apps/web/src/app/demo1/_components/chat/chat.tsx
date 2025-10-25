import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react"
import { useEffect } from "react"
import { Toggle } from "@/components/ui/toggle"
import { useWorkspaceContext } from "../provider"
import { Workspace } from "../workspace"
import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { ChatSettings } from "./chat-settings"
import { ChatTitleBar } from "./chat-titlebar"
import { useChat, useSendMessage, useTabLocalState } from "./state"

export function Chat({
  tabId,
  chatId,
  stateKey,
}: {
  tabId: string
  chatId?: Id<"chats_v0">
  stateKey: string
}) {
  const { controls } = useWorkspaceContext()
  const chat = useChat(chatId ?? "")

  const [tabState] = useTabLocalState(stateKey)

  // Get setters for chat settings
  const setModelId = useSetAtom(tabState.modelId)
  const setTemperature = useSetAtom(tabState.temperature)
  const setMaxOutputTokens = useSetAtom(tabState.maxOutputTokens)
  const setInstructions = useSetAtom(tabState.instructions)

  // Sync chat settings with local state when chat is loaded
  useEffect(() => {
    if (!chat) return

    // Update local state with chat settings from the backend
    if (chat.modelId !== undefined) setModelId(chat.modelId)
    if (chat.temperature !== undefined) setTemperature(chat.temperature)
    if (chat.maxOutputTokens !== undefined) setMaxOutputTokens(chat.maxOutputTokens)
    if (chat.instructions !== undefined) setInstructions(chat.instructions)
  }, [chat, setModelId, setTemperature, setMaxOutputTokens, setInstructions])

  const handleSubmit = useSendMessage({
    stateKey,
    chatId,
    onSuccess: (args) => {
      if (args.chatId !== chatId) {
        controls.updateTab(tabId, {
          componentType: "chat",
          componentId: args.chatId,
        })
      }
    },
  })

  return (
    <Workspace.Group>
      <Workspace.Stack>
        <ChatTitleBar>
          <div />
          <div className="text-center">{chat?.title || "Untitled Chat"}</div>
          <div className="text-right">
            <SidebarToggle stateKey={stateKey} />
          </div>
        </ChatTitleBar>

        {chat && (
          <ChatConversation chatId={chat._id}>
            <ChatInput onSubmit={handleSubmit} stateKey={stateKey} />
          </ChatConversation>
        )}

        {/* new chat */}
        {!chatId && (
          <div className="flex flex-1 items-center *:w-full">
            <ChatInput onSubmit={handleSubmit} stateKey={stateKey} />
          </div>
        )}
      </Workspace.Stack>

      <ChatSidebar stateKey={stateKey} />
    </Workspace.Group>
  )
}

function ChatSidebar({ stateKey }: { stateKey: string }) {
  const [tabState] = useTabLocalState(stateKey)
  const isSidebarOpen = useAtomValue(tabState.sidebarOpen)
  return (
    <Workspace.CollapsiblePanel className="w-72" isCollapsed={!isSidebarOpen}>
      <Workspace.Stack>
        <ChatSettings className="w-72" stateKey={stateKey} />
      </Workspace.Stack>
    </Workspace.CollapsiblePanel>
  )
}

function SidebarToggle({ stateKey }: { stateKey: string }) {
  const [tabState] = useTabLocalState(stateKey)
  const [isSidebarOpen, setSidebarOpen] = useAtom(tabState.sidebarOpen)

  return (
    <Toggle
      aria-label="Toggle sidebar"
      className="group data-[state=on]:bg-transparent data-[state=on]:text-muted-foreground"
      onPressedChange={setSidebarOpen}
      pressed={isSidebarOpen}
    >
      <PanelRightCloseIcon className="group-data-[state=off]:hidden" />
      <PanelRightOpenIcon className="group-data-[state=on]:hidden" />
    </Toggle>
  )
}
