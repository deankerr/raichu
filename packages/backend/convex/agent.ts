import { openai } from "@ai-sdk/openai"
import { Agent } from "@convex-dev/agent"
import { openrouter } from "@openrouter/ai-sdk-provider"
import { omit } from "convex-helpers"
import { components } from "./_generated/api"
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
