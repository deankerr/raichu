import { openai } from "@ai-sdk/openai"
import { Agent } from "@convex-dev/agent"
import { openrouter } from "@openrouter/ai-sdk-provider"
import { omit } from "convex-helpers"
import { components } from "./_generated/api"
import { DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_MODEL_ID, DEFAULT_TEMPERATURE } from "./constants"
import { todoTools } from "./todoTools"

export const basicAgent = new Agent(components.agent, {
  name: "SmartRutter Home Assistant",
  languageModel: openrouter.chat("mistralai/mistral-small-3.2-24b-instruct"),
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  instructions:
    "You are a helpful AI assistant named SmartRutter Home Assistant. Be concise, helpful, and engaging. You can help users manage their todo lists using the available tools.",
  tools: todoTools,
  rawRequestResponseHandler: (_ctx, { request, response, ...rest }) => {
    console.log(rest, request.body, omit(response, ["headers"]))
  },
  callSettings: {
    temperature: 0.5,
  },
  maxSteps: 10,
})

export function createAgent({
  name,
  modelId = DEFAULT_MODEL_ID,
  temperature = DEFAULT_TEMPERATURE,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
}: {
  name: string
  modelId?: string
  temperature?: number
  maxOutputTokens?: number
}) {
  return new Agent(components.agent, {
    name,
    languageModel: openrouter.chat(modelId),
    textEmbeddingModel: openai.embedding("text-embedding-3-small"),
    instructions:
      "You are a helpful AI assistant named SmartRutter Home Assistant. Be concise, helpful, and engaging. You can help users manage their todo lists using the available tools.",
    tools: todoTools,
    rawRequestResponseHandler: (_ctx, { request, response, ...rest }) => {
      console.log(rest, request.body, omit(response, ["headers"]))
    },
    callSettings: {
      temperature,
      maxOutputTokens,
    },
    maxSteps: 10,
  })
}
