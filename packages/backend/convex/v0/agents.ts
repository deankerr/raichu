import { openai } from "@ai-sdk/openai"
import { Agent } from "@convex-dev/agent"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { ConvexError, v } from "convex/values"
import { omit } from "convex-helpers"
import { components, internal } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import { type ActionCtx, internalAction, internalQuery } from "../_generated/server"
import { DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_MODEL_ID, DEFAULT_TEMPERATURE } from "../constants"
import { getUserOpenRouterApiKey } from "./lib/auth"

export const _getChat = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => await ctx.db.get(args.chatId),
})

export const _getlanguageModelPreset = internalQuery({
  args: {
    languageModelPresetId: v.id("languageModelPresets"),
  },
  handler: async (ctx, args) => await ctx.db.get(args.languageModelPresetId),
})

export const _getAgentPreset = internalQuery({
  args: {
    agentPresetId: v.id("agentPresets"),
  },
  handler: async (ctx, args) => await ctx.db.get(args.agentPresetId),
})

// todo: improve this
async function buildChatAgent(
  ctx: ActionCtx,
  { chatId, userSubject }: { chatId: Id<"chats">; userSubject: string }
) {
  const chat = await ctx.runQuery(internal.v0.agents._getChat, { chatId })
  if (!chat) throw new ConvexError({ message: "chat not found.", chatId })

  const languageModelPreset = chat.languageModelPresetId
    ? await ctx.runQuery(internal.v0.agents._getlanguageModelPreset, {
        languageModelPresetId: chat.languageModelPresetId,
      })
    : undefined

  const agentPreset = chat.agentPresetId
    ? await ctx.runQuery(internal.v0.agents._getAgentPreset, { agentPresetId: chat.agentPresetId })
    : undefined

  const openrouterProvider = createOpenRouter({
    apiKey: await getUserOpenRouterApiKey({ subject: userSubject }),
    compatibility: "strict",
    extraBody: {
      usage: {
        include: true,
      },
      provider: {
        data_collection: "allow",
      },
    },
  })

  const modelId =
    chat.languageModelSettings?.modelId ?? languageModelPreset?.modelId ?? DEFAULT_MODEL_ID

  return new Agent(components.agent, {
    // constant
    textEmbeddingModel: openai.embedding("text-embedding-3-small"),
    rawRequestResponseHandler: (_ctx, { request, response, ...rest }) => {
      console.log(rest, request.body, omit(response, ["headers"]))
    },
    maxSteps: 10,

    // from chat settings
    name: chat.agentSettings?.name ?? agentPreset?.name ?? modelId, // TODO: replace modelId with model name when we have it
    languageModel: openrouterProvider.chat(modelId),
    instructions: chat.agentSettings?.instructions ?? agentPreset?.instructions,
    callSettings: {
      temperature:
        chat.languageModelSettings?.temperature ??
        languageModelPreset?.temperature ??
        DEFAULT_TEMPERATURE,
      maxOutputTokens:
        chat.languageModelSettings?.maxOutputTokens ??
        languageModelPreset?.maxOutputTokens ??
        DEFAULT_MAX_OUTPUT_TOKENS,
      topP: chat.languageModelSettings?.topP ?? languageModelPreset?.topP,
    },
  })
}

export const streamResponseAsync = internalAction({
  args: {
    userSubject: v.string(),
    threadId: v.string(),
    promptMessageId: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, { threadId, chatId, userSubject }) => {
    const agent = await buildChatAgent(ctx, { chatId, userSubject })

    const result = await agent.streamText(
      ctx,
      { threadId },
      {},
      // more custom delta options (`true` uses defaults)
      { saveStreamDeltas: true }
    )
    // We need to make sure the stream finishes - by awaiting each chunk
    // or using this call to consume it all.
    await result.consumeStream()
  },
})
