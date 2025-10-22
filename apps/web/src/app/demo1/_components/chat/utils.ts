import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"

export function validateMessage(message: PromptInputMessage): string | null {
  const text = message.text?.trim()
  return text || null
}
