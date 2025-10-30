import { createThread } from "@convex-dev/agent"
import { ConvexError, v } from "convex/values"
import { omit } from "convex-helpers"
import { nullable, partial } from "convex-helpers/validators"
import { components } from "../_generated/api"
import type { Doc } from "../_generated/dataModel"
import { mutation, type QueryCtx, query } from "../_generated/server"
import { MAX_LABEL_LENGTH } from "../constants"
import schema from "../schema"
import { getAuthorizedUser, getAuthorizedUserOrThrow, getOrCreateAuthorizedUser } from "./users"

export type ChatDoc = Doc<"chats">
const vChatTable = schema.tables.chats.validator

export async function getAuthorizedChatOrThrow(ctx: QueryCtx, args: { id: string }) {
  const user = await getAuthorizedUserOrThrow(ctx)

  const chatId = ctx.db.normalizeId("chats", args.id)
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
    id: v.id("chats"),
  },
  handler: async (ctx, args) => await getAuthorizedChatOrThrow(ctx, args),
})

export const list = query({
  handler: async (ctx) => {
    const user = await getAuthorizedUser(ctx)
    if (!user) {
      return []
    }

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    return chats
  },
})

const vCreateChatArgs = partial(omit(vChatTable.fields, ["updatedAt", "userId", "threadId"]))

export const create = mutation({
  args: vCreateChatArgs,
  handler: async (ctx, args) => {
    const user = await getOrCreateAuthorizedUser(ctx)

    const threadId = await createThread(ctx, components.agent, {
      userId: user._id,
    })

    const chatId = await ctx.db.insert("chats", {
      updatedAt: Date.now(),
      userId: user._id,
      threadId,
      ...args,
      label: args.label ? args.label.slice(0, MAX_LABEL_LENGTH) : "",
    })

    return { chatId }
  },
})

const vUpdateChatArgs = {
  id: v.id("chats"),
  ...partial(omit(vChatTable.fields, ["updatedAt", "userId", "threadId"])),
  languageModelPresetId: v.optional(nullable(v.id("languageModelPresets"))),
  agentPresetId: v.optional(nullable(v.id("agentPresets"))),
}

export const update = mutation({
  args: vUpdateChatArgs,
  handler: async (ctx, { id, ...args }) => {
    const chat = await getAuthorizedChatOrThrow(ctx, { id })

    const { languageModelPresetId, agentPresetId, ...fields } = args

    await ctx.db.patch(chat._id, {
      ...fields,
      languageModelPresetId: languageModelPresetId === null ? undefined : languageModelPresetId,
      agentPresetId: agentPresetId === null ? undefined : agentPresetId,
    })
  },
})

export const del = mutation({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await getAuthorizedChatOrThrow(ctx, args)

    await ctx.scheduler.runAfter(0, components.agent.threads.deleteAllForThreadIdAsync, {
      threadId: chat.threadId,
    })

    await ctx.db.delete(chat._id)
  },
})
