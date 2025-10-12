import type { UIMessage } from "@convex-dev/agent/react"
import { api } from "@raichu/backend/convex/_generated/api"
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

export function ChatMessage({
  message,
  isLatestMessage,
}: {
  message: UIMessage
  isLatestMessage: boolean
}) {
  const deleteMessage = useMutation(api.chat.message.delete_)
  const openrouter = getOpenRouterMetadata(message.parts?.[0])
  return (
    <div
      className="group relative"
      data-message-role={message.role}
      data-slot="chat-message"
      key={message.key}
    >
      {/* * name */}
      <div className="mb-0.5 flex items-center gap-1 font-medium text-muted-foreground text-xs capitalize group-data-[message-role=user]:justify-end [&>svg]:size-3.5">
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
                  defaultOpen={
                    toolPart.state === "output-available" || toolPart.state === "output-error"
                  }
                  key={`${message.id}-${i}`}
                >
                  <ToolHeader state={toolPart.state} type={toolPart.type} />
                  <ToolContent>
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
      <Actions className={cn("mt-0", message.role === "user" && "justify-end")}>
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

        <div className="px-1 font-mono text-[10px] text-muted-foreground empty:hidden">
          {openrouter && `${openrouter.model} via ${openrouter.provider}`}
        </div>
      </Actions>
    </div>
  )
}

const PartProviderMetadataSchema = z.object({
  providerMetadata: z.object({
    openrouter: z.object({
      provider: z.string(),
      model: z.string(),
      usage: z.object({
        completionTokens: z.number(),
        completionTokensDetails: z.object({
          reasoningTokens: z.number(),
        }),
        cost: z.number(),
        promptTokens: z.number(),
        promptTokensDetails: z.object({
          cachedTokens: z.number(),
        }),
        totalTokens: z.number(),
      }),
    }),
  }),
})

function getOpenRouterMetadata(part?: unknown) {
  const parsed = PartProviderMetadataSchema.safeParse(part)
  if (parsed.success) {
    return parsed.data.providerMetadata.openrouter
  }
}
