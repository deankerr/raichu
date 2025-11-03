import { useAtom } from "jotai"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { chatModelIds } from "./data"
import { useChat } from "./provider"

export function ChatSettings({
  stateKey,
  className,
  ...props
}: {
  stateKey: string
} & React.ComponentProps<"div">) {
  const chat = useChat()

  const [languageModelSettings, setLanguageModelSettings] = useAtom(chat.languageModelSettingsAtom)
  const modelId = languageModelSettings?.modelId || chatModelIds[0].value

  const [agentSettings, setAgentSettings] = useAtom(chat.agentSettingsAtom)

  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      <div className="font-medium text-sm">Chat Settings</div>

      {/* Model Selection */}
      <Field>
        <FieldLabel htmlFor="model-select">Model</FieldLabel>
        <FieldContent>
          <Select
            onValueChange={(value) =>
              setLanguageModelSettings((prev) => ({ ...prev, modelId: value }))
            }
            value={modelId}
          >
            <SelectTrigger className="w-full" id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {chatModelIds.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.name ?? model.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      {/* Temperature */}
      <Field>
        <FieldLabel htmlFor="temperature">
          Temperature: {languageModelSettings?.temperature}
        </FieldLabel>
        <FieldContent>
          <Slider
            className="w-full"
            id="temperature"
            max={2}
            min={0}
            onValueChange={(value) => {
              setLanguageModelSettings((prev) => ({
                ...prev,
                modelId,
                temperature: value[0],
              }))
            }}
            step={0.1}
            value={[languageModelSettings?.temperature ?? 1]}
          />
        </FieldContent>
      </Field>

      {/* Max Tokens */}
      <Field>
        <FieldLabel htmlFor="max-tokens">Max Tokens</FieldLabel>
        <FieldContent>
          <Input
            id="max-tokens"
            max="4000"
            min="1"
            onChange={(e) =>
              setLanguageModelSettings((prev) => ({
                ...prev,
                modelId,
                maxOutputTokens: Number.parseInt(e.target.value, 10),
              }))
            }
            type="number"
            value={languageModelSettings?.maxOutputTokens}
          />
        </FieldContent>
      </Field>

      {/* Instructions */}
      <Field>
        <FieldLabel htmlFor="instructions">System Instructions</FieldLabel>
        <FieldContent>
          <Textarea
            id="instructions"
            onChange={(e) =>
              setAgentSettings((prev) => ({
                ...prev,
                instructions: e.target.value,
              }))
            }
            placeholder="Enter system instructions for the AI..."
            rows={4}
            value={agentSettings?.instructions}
          />
        </FieldContent>
      </Field>
    </div>
  )
}
