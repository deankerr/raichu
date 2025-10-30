import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const vLanguageModelSettings = v.object({
  modelId: v.string(), // e.g. "deepseek/deepseek-r1"
  temperature: v.optional(v.number()),
  topP: v.optional(v.number()),
  maxOutputTokens: v.optional(v.number()),
})

export const vAgentSettings = v.object({
  name: v.optional(v.string()), // e.g. "Web Dev Expert", fallback to model name e.g. "Deepseek R1"
  instructions: v.optional(v.string()), // system prompt
  // ... tools available?
  // ... memories?
})

export default defineSchema({
  users: defineTable({
    updatedAt: v.number(),
    tokenIdentifier: v.string(),

    // TODO:
    // defaults: v.object({
    //   languageModelPresetId: v.optional(v.id("languageModelPresets")),
    //   languageModelSettings: v.optional(vLanguageModelSettings),
    //   agentPresetId: v.optional(v.id("agentPresets")),
    //   agentSettings: v.optional(vAgentSettings),
    // }),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  chats: defineTable({
    updatedAt: v.number(),
    userId: v.id("users"),
    threadId: v.string(),

    label: v.string(),
    languageModelPresetId: v.optional(v.id("languageModelPresets")),
    languageModelSettings: v.optional(vLanguageModelSettings),
    agentPresetId: v.optional(v.id("agentPresets")),
    agentSettings: v.optional(vAgentSettings),

    // ... tools available?
    // ... memories?
  })
    .index("by_userId", ["userId"])
    .index("by_languageModelPresetId", ["languageModelPresetId"])
    .index("by_agentPresetId", ["agentPresetId"]),

  languageModelPresets: defineTable({
    updatedAt: v.number(),
    userId: v.id("users"),

    label: v.string(),
    ...vLanguageModelSettings.fields,
  }).index("by_userId", ["userId"]),

  agentPresets: defineTable({
    updatedAt: v.number(),
    userId: v.id("users"),

    label: v.string(),
    ...vAgentSettings.fields,
  }).index("by_userId", ["userId"]),

  personalNotes: defineTable({
    updatedAt: v.number(),
    userId: v.id("users"),

    contentId: v.id("personalNoteContents"),
    label: v.string(),
  }).index("by_userId", ["userId"]),

  personalNoteContents: defineTable({
    updatedAt: v.number(),
    userId: v.id("users"),

    content: v.string(),
  }).index("by_userId", ["userId"]),
})
