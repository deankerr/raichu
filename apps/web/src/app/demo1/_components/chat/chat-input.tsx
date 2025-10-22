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
import { useTabLocalState } from "./state"

export function ChatInput({
  stateKey,
  onSubmit,
}: {
  stateKey: string
  onSubmit: React.ComponentProps<typeof PromptInput>["onSubmit"]
}) {
  const [tabState] = useTabLocalState(stateKey)
  const [input, setInput] = useAtom(tabState.input)
  const [modelId = chatModelIds[0].value, setModelId] = useAtom(tabState.modelId)

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
