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
import { useTabLocalState } from "./state"

export function ChatSettings({
  stateKey,
  className,
  ...props
}: {
  stateKey: string
} & React.ComponentProps<"div">) {
  const [tabState] = useTabLocalState(stateKey)

  const [modelId, setModelId] = useAtom(tabState.modelId)
  const [temperature, setTemperature] = useAtom(tabState.temperature)
  const [maxOutputTokens, setMaxOutputTokens] = useAtom(tabState.maxOutputTokens)
  const [instructions, setInstructions] = useAtom(tabState.instructions)

  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      <div className="font-medium text-sm">Chat Settings</div>

      {/* Model Selection */}
      <Field>
        <FieldLabel htmlFor="model-select">Model</FieldLabel>
        <FieldContent>
          <Select onValueChange={setModelId} value={modelId || chatModelIds[0].value}>
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
        <FieldLabel htmlFor="temperature">Temperature: {temperature}</FieldLabel>
        <FieldContent>
          <Slider
            className="w-full"
            id="temperature"
            max={2}
            min={0}
            onValueChange={(value) => setTemperature(value[0])}
            step={0.1}
            value={[temperature]}
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
            onChange={(e) => setMaxOutputTokens(Number.parseInt(e.target.value, 10))}
            type="number"
            value={maxOutputTokens}
          />
        </FieldContent>
      </Field>

      {/* Instructions */}
      <Field>
        <FieldLabel htmlFor="instructions">System Instructions</FieldLabel>
        <FieldContent>
          <Textarea
            id="instructions"
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter system instructions for the AI..."
            rows={4}
            value={instructions}
          />
        </FieldContent>
      </Field>
    </div>
  )
}
