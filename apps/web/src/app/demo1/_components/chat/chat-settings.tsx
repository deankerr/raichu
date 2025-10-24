import { useAtom } from "jotai"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { chatModelIds } from "./data"
import { useTabLocalState } from "./state"

export function ChatSettings({ stateKey }: { stateKey: string }) {
  const [tabState] = useTabLocalState(stateKey)

  const [modelId, setModelId] = useAtom(tabState.modelId)
  const [temperature, setTemperature] = useAtom(tabState.temperature)
  const [maxOutputTokens, setMaxOutputTokens] = useAtom(tabState.maxOutputTokens)
  const [instructions, setInstructions] = useAtom(tabState.instructions)

  return (
    <div className="w-64 space-y-4 p-4">
      <h3 className="font-medium text-sm">Chat Settings</h3>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model-select">Model</Label>
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
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature: {temperature}</Label>
        <Slider
          className="w-full"
          id="temperature"
          max={2}
          min={0}
          onValueChange={(value) => setTemperature(value[0])}
          step={0.1}
          value={[temperature]}
        />
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <Label htmlFor="max-tokens">Max Tokens</Label>
        <Input
          id="max-tokens"
          max="4000"
          min="1"
          onChange={(e) => setMaxOutputTokens(Number.parseInt(e.target.value, 10))}
          type="number"
          value={maxOutputTokens}
        />
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label htmlFor="instructions">System Instructions</Label>
        <Textarea
          id="instructions"
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter system instructions for the AI..."
          rows={4}
          value={instructions}
        />
      </div>
    </div>
  )
}
