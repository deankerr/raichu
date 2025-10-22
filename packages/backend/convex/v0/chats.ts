import { createThread } from "@convex-dev/agent"
import { ConvexError, v } from "convex/values"
import { components } from "../_generated/api"
import type { Doc } from "../_generated/dataModel"
import { mutation, type QueryCtx, query } from "../_generated/server"
import { DEFAULT_MODEL_ID } from "../constants"
import { getAuthorizedUserOrThrow, getOrCreateAuthorizedUser } from "./users"

export type ChatDoc = Doc<"chats_v0">

export async function getAuthorizedChatOrThrow(ctx: QueryCtx, args: { id: string }) {
  const user = await getAuthorizedUserOrThrow(ctx)

  const chatId = ctx.db.normalizeId("chats_v0", args.id)
  if (!chatId) {
    throw new ConvexError("Invalid chat id.")
  }

  const chat = await ctx.db.get(chatId)

  if (!chat) {
    throw new ConvexError("chat not found.")
  }

  if (chat.userId !== user._id) {
    throw new ConvexError("Forbidden.")
  }

  return chat
}

export const get = query({
  args: {
    id: v.id("chats_v0"),
  },
  handler: async (ctx, args) => await getAuthorizedChatOrThrow(ctx, args),
})

export const list = query({
  handler: async (ctx) => {
    const user = await getAuthorizedUserOrThrow(ctx)
    const chats = await ctx.db
      .query("chats_v0")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    return chats
  },
})

export const create = mutation({
  args: {
    title: v.optional(v.string()),

    modelId: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateAuthorizedUser(ctx)
    const threadId = await createThread(ctx, components.agent, {
      userId: user._id,
    })

    const { title = "", modelId = DEFAULT_MODEL_ID, temperature, maxOutputTokens } = args

    const chatId = await ctx.db.insert("chats_v0", {
      userId: user._id,
      threadId,
      title,
      modelId,
      temperature,
      maxOutputTokens,
    })

    return { chatId }
  },
})

export const del = mutation({
  args: {
    id: v.id("chats_v0"),
  },
  handler: async (ctx, args) => {
    const chat = await getAuthorizedChatOrThrow(ctx, args)

    await ctx.scheduler.runAfter(0, components.agent.threads.deleteAllForThreadIdAsync, {
      threadId: chat.threadId,
    })

    await ctx.db.delete(chat._id)
  },
})
