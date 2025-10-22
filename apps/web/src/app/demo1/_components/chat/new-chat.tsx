import { useWorkspaceContext } from "../provider"
import { Workspace } from "../workspace"
import { ChatInput } from "./chat-input"
import { ChatTitleBar } from "./chat-titlebar"
import { useSendMessage } from "./state"

export function NewChat({ tabId, stateKey }: { tabId: string; stateKey: string }) {
  const { controls } = useWorkspaceContext()

  const handleSubmit = useSendMessage({
    stateKey,
    onSuccess: ({ chatId }) => {
      controls.updateTab(tabId, {
        componentType: "chat",
        componentId: chatId,
      })
    },
  })

  return (
    <Workspace.Stack>
      <ChatTitleBar>
        <div />
        <div className="text-center">New Chat</div>
        <div />
      </ChatTitleBar>

      <div className="flex flex-1 items-center *:w-full">
        <ChatInput onSubmit={handleSubmit} stateKey={stateKey} />
      </div>
    </Workspace.Stack>
  )
}
