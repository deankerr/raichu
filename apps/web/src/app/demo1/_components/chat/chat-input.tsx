import { useAtom } from "jotai"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { chatModelIds } from "./data"
import { useChatInputAtoms } from "./use-chat"

export function ChatInput({
  instanceId,
  onSubmit,
}: {
  instanceId: string
  onSubmit: React.ComponentProps<typeof PromptInput>["onSubmit"]
}) {
  const [chatAtom] = useChatInputAtoms(instanceId)
  const [input, setInput] = useAtom(chatAtom.input)
  const [modelId = chatModelIds[0].value, setModelId] = useAtom(chatAtom.modelId)

  return (
    <div className="bg-background">
      <PromptInput className="mx-auto max-w-3xl" globalDrop multiple onSubmit={onSubmit}>
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            {/* <PromptInputButton
              variant={webSearch ? "default" : "ghost"}
              onClick={() => setWebSearch(!webSearch)}
            >
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton> */}
            <PromptInputModelSelect
              onValueChange={(value) => {
                setModelId(value)
              }}
              value={modelId}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {chatModelIds.map((m) => (
                  <PromptInputModelSelectItem key={m.value} value={m.value}>
                    {m.name ?? m.value}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}
