import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  todoLists: defineTable({
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.string(),
    listId: v.id("todoLists"),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    completedAt: v.optional(v.number()),
  })
    .index("by_user_and_list", ["userId", "listId"])
    .index("by_list", ["listId"])
    .index("by_user_and_completed", ["userId", "completed"]),

  chats_v0: defineTable({
    userId: v.id("users"),
    threadId: v.string(),

    title: v.string(),

    modelId: v.string(),
    temperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
})
