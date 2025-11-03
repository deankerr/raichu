import { ChatConversation } from "./chat-conversation"
import { ChatInput } from "./chat-input"
import { ChatTitleBar } from "./chat-titlebar"
import { ChatProvider } from "./provider"

export function Chat() {
  // const [chat] = useChat()

  // const { updateResourceId } = useWorkspaceCommands()

  // const handleSubmit = useSendMessage({
  //   stateKey,
  //   chatId,
  //   onSuccess: (args) => {
  //     if (args.chatId !== chatId) {
  //       // New chat was created, update the view's resourceId
  //       updateResourceId(viewId, args.chatId)
  //     }
  //   },
  // })

  const handleSubmit = () => {
    // todo
  }

  return (
    <div className="flex flex-col overflow-x-hidden">
      <ChatTitleBar />
      <ChatConversation>
        <ChatInput onSubmit={handleSubmit} />
      </ChatConversation>
    </div>
  )
}

export function ChatView({ viewId, resourceId }: { viewId: string; resourceId?: string }) {
  return (
    <ChatProvider resourceId={resourceId} viewId={viewId}>
      <Chat />
    </ChatProvider>
  )
}
