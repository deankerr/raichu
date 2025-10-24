import type { UIMessage } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import type { ToolUIPart } from "ai"
import { useMutation } from "convex/react"
import {
  BotMessageSquareIcon,
  CodeIcon,
  CopyIcon,
  DroneIcon,
  RefreshCcwIcon,
  TrashIcon,
  User2Icon,
} from "lucide-react"
import { z } from "zod"
import { Action, Actions } from "@/components/ai-elements/actions"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning"
import { Response } from "@/components/ai-elements/response"
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/sources"
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool"
import { cn } from "@/lib/utils"

const roleIcons = {
  user: <User2Icon />,
  assistant: <BotMessageSquareIcon />,
  system: <DroneIcon />,
} as const

const MIN_DECIMAL_PLACES = 2
const MAX_DECIMAL_PLACES = 8

function MessageMetadata({
  openrouter,
  className,
  ...props
}: {
  openrouter: ReturnType<typeof getOpenRouterMetadata>
} & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-1 py-1 font-mono text-[10px] text-muted-foreground empty:hidden",
        className
      )}
      {...props}
    >
      {openrouter && (
        <>
          {`${openrouter.model} via ${openrouter.provider} `}
          {openrouter.usage.promptTokens > 0 &&
            `Input: ${openrouter.usage.promptTokens.toLocaleString()}`}
          {openrouter.usage.completionTokens > 0 &&
            ` Output: ${openrouter.usage.completionTokens.toLocaleString()}`}
          {openrouter.usage.reasoningTokens > 0 &&
            ` Reasoning: ${openrouter.usage.reasoningTokens.toLocaleString()}`}
          {openrouter.usage.cachedTokens > 0 &&
            ` Cache: ${openrouter.usage.cachedTokens.toLocaleString()}`}
          {openrouter.usage.cost > 0 &&
            ` $${openrouter.usage.cost.toLocaleString("en-US", { minimumFractionDigits: MIN_DECIMAL_PLACES, maximumFractionDigits: MAX_DECIMAL_PLACES })}`}
        </>
      )}
    </div>
  )
}

export function ChatMessage({
  message,
  chatId,
  isLatestMessage,
  showActions = true,
  className,
  ...props
}: {
  message: UIMessage
  chatId: Id<"chats_v0">
  isLatestMessage: boolean
  showActions?: boolean
} & React.ComponentProps<"div">) {
  const deleteMessage = useMutation(api.v0.messages.del)
  const openrouter = getOpenRouterMetadata(message.parts)
  return (
    <div
      className={cn("group relative", className)}
      data-message-role={message.role}
      data-slot="chat-message"
      key={message.key}
      {...props}
    >
      {/* * name */}
      <div className="mb-1 flex items-center gap-1 font-medium text-muted-foreground text-xs capitalize group-data-[message-role=user]:justify-end [&>svg]:size-3.5">
        {message.agentName ?? message.role} {roleIcons[message.role]}
      </div>

      {/* * Sources */}
      {message.parts.filter((part) => part.type === "source-url").length > 0 && (
        <Sources>
          <SourcesTrigger
            count={message.parts.filter((part) => part.type === "source-url").length}
          />
          {message.parts
            .filter((part) => part.type === "source-url")
            .map((part, i) => (
              <SourcesContent key={`${message.id}-${i}`}>
                <Source href={part.url} key={`${message.id}-${i}`} title={part.url} />
              </SourcesContent>
            ))}
        </Sources>
      )}

      {/* * Parts */}
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "reasoning":
            // * Reasoning
            return (
              <Reasoning
                className="mt-2 mb-1 text-xs"
                isStreaming={
                  part.state === "streaming" && i === message.parts.length - 1 && isLatestMessage
                }
                key={`${message.id}-${i}`}
              >
                <ReasoningTrigger />
                <ReasoningContent className="mt-1 max-h-60 overflow-y-auto rounded-md border bg-black/30 px-2 py-1">
                  {part.text}
                </ReasoningContent>
              </Reasoning>
            )

          // * Text
          case "text":
            return (
              <Message className="py-1" from={message.role} key={`${message.id}-${i}`}>
                <MessageContent variant="flat">
                  <Response>{part.text}</Response>
                </MessageContent>
              </Message>
            )

          default:
            // Handle tool parts (e.g., "tool-listTodoLists", "tool-createTodo", etc.)
            if (part.type?.startsWith("tool-")) {
              // biome-ignore lint/suspicious/noExplicitAny: generic tool ui
              const toolPart = part as ToolUIPart<any>
              return (
                <Tool
                  className="mt-2"
                  defaultOpen={
                    toolPart.state === "output-available" || toolPart.state === "output-error"
                  }
                  key={`${message.id}-${i}`}
                >
                  <ToolHeader state={toolPart.state} type={toolPart.type} />
                  <ToolContent className="[&_code]:text-xs">
                    <ToolInput input={toolPart.input} />
                    {(toolPart.state === "output-available" ||
                      toolPart.state === "output-error") && (
                      <ToolOutput errorText={toolPart.errorText} output={toolPart.output} />
                    )}
                  </ToolContent>
                </Tool>
              )
            }
            return null
        }
      })}

      {/* * Actions */}
      <div className="flex items-center gap-2 group-data-[message-role=user]:justify-end">
        {showActions && (
          <Actions className={cn("mt-0 shrink-0")}>
            <div className="px-1 font-mono text-[10px] text-muted-foreground">
              {message.id.slice(0, 8)}
            </div>
            {message.role === "assistant" && isLatestMessage && (
              <Action
                disabled // TODO
                label="Retry"
                // onClick={() => regenerate()}
              >
                <RefreshCcwIcon className="size-3" />
              </Action>
            )}
            <Action label="Copy" onClick={() => navigator.clipboard.writeText(message.text)}>
              <CopyIcon className="size-3" />
            </Action>

            <Action label="Console" onClick={() => console.log(message)}>
              <CodeIcon className="size-3" />
            </Action>

            <Action label="Delete" onClick={() => deleteMessage({ messageId: message.id })}>
              <TrashIcon className="size-3" />
            </Action>
          </Actions>
        )}

        <MessageMetadata openrouter={openrouter} />
      </div>
    </div>
  )
}

const OpenRouterMetadataSchema = z.object({
  openrouter: z.object({
    provider: z.string(),
    model: z.string(),
    usage: z.object({
      completionTokens: z.number(),
      completionTokensDetails: z
        .object({
          reasoningTokens: z.number(),
        })
        .optional(),
      cost: z.number().optional(),
      promptTokens: z.number(),
      promptTokensDetails: z
        .object({
          cachedTokens: z.number(),
        })
        .optional(),
      totalTokens: z.number(),
    }),
  }),
})

function extractOpenRouterMetadata(part: Record<string, unknown>) {
  try {
    if ("providerMetadata" in part) {
      return OpenRouterMetadataSchema.parse(part.providerMetadata)
    }

    if ("callProviderMetadata" in part) {
      return OpenRouterMetadataSchema.parse(part.callProviderMetadata)
    }

    return null
  } catch (err) {
    console.warn(err)
    return null
  }
}

function getOpenRouterMetadata(parts: Record<string, unknown>[] = []) {
  let totalPromptTokens = 0
  let totalCompletionTokens = 0
  let totalReasoningTokens = 0
  let totalCachedTokens = 0
  let totalCost = 0
  let lastModel = ""
  let provider = ""

  for (const part of parts) {
    const metadata = extractOpenRouterMetadata(part)?.openrouter
    if (metadata) {
      totalPromptTokens += metadata.usage.promptTokens
      totalCompletionTokens += metadata.usage.completionTokens
      totalReasoningTokens += metadata.usage.completionTokensDetails?.reasoningTokens || 0
      totalCachedTokens += metadata.usage.promptTokensDetails?.cachedTokens || 0
      totalCost += metadata.usage.cost ?? 0
      lastModel = metadata.model
      provider = metadata.provider
    }
  }

  if (!lastModel) {
    return null
  }

  return {
    provider,
    model: lastModel,
    usage: {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      reasoningTokens: totalReasoningTokens,
      cachedTokens: totalCachedTokens,
      cost: totalCost,
      totalTokens: totalPromptTokens + totalCompletionTokens,
    },
  }
}
