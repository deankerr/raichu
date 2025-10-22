import { openai } from "@ai-sdk/openai"
import { Agent } from "@convex-dev/agent"
import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider"
import { ConvexError, v } from "convex/values"
import { omit } from "convex-helpers"
import { components } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_MODEL_ID, DEFAULT_TEMPERATURE } from "../constants"
import { stackServerApp } from "../lib/stack"
import { todoTools } from "../todoTools"

export const baseAgent = new Agent(components.agent, {
  name: "SmartRutter Home Assistant",
  languageModel: openrouter.chat(DEFAULT_MODEL_ID),
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  instructions:
    "You are a helpful AI assistant named SmartRutter Home Assistant. Be concise, helpful, and engaging. You can help users manage their todo lists using the available tools.",
  tools: todoTools,
  rawRequestResponseHandler: (_ctx, { request, response, ...rest }) => {
    console.log(rest, request.body, omit(response, ["headers"]))
  },
  callSettings: {
    temperature: DEFAULT_TEMPERATURE,
    maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
  },
  maxSteps: 10,
})

export const streamResponseAsync = internalAction({
  args: {
    userSubject: v.string(),
    threadId: v.string(),
    promptMessageId: v.string(),

    modelId: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, userSubject, modelId, ...args }) => {
    const stackUser = await stackServerApp.getUser(userSubject)
    if (!stackUser) {
      throw new ConvexError({
        message: "User not found",
      })
    }

    const openrouterApiKey = stackUser.serverMetadata?.openrouterApiKey
    if (!openrouterApiKey) {
      throw new ConvexError({
        message: "OpenRouter API key not found",
      })
    }

    const openrouterProvider = createOpenRouter({
      apiKey: openrouterApiKey,
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

    const result = await baseAgent.streamText(
      ctx,
      { threadId },
      {
        ...args,
        model: openrouterProvider.chat(modelId ?? DEFAULT_MODEL_ID),
      },
      // more custom delta options (`true` uses defaults)
      { saveStreamDeltas: true }
    )
    // We need to make sure the stream finishes - by awaiting each chunk
    // or using this call to consume it all.
    await result.consumeStream()
  },
})
