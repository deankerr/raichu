import { createThread } from "@convex-dev/agent"
import { ConvexError, v } from "convex/values"
import { omit } from "convex-helpers"
import { nullable, partial } from "convex-helpers/validators"
import { components } from "../_generated/api"
import type { Doc } from "../_generated/dataModel"
import { mutation, type QueryCtx, query } from "../_generated/server"
import { MAX_LABEL_LENGTH } from "../constants"
import schema from "../schema"
import { nullToUndefined } from "./lib/utils"
import { getAuthorizedUser, getAuthorizedUserOrThrow, getOrCreateAuthorizedUser } from "./users"

export type ChatDoc = Doc<"chats">
const vChatTable = schema.tables.chats.validator
const vChatConfigurableFields = omit(vChatTable.fields, ["updatedAt", "userId", "threadId"])

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

export const create = mutation({
  args: partial(vChatConfigurableFields),
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

export const update = mutation({
  args: {
    id: v.id("chats"),
    fields: v.object(
      partial({
        ...vChatConfigurableFields,
        languageModelPresetId: nullable(v.id("languageModelPresets")),
        agentPresetId: nullable(v.id("agentPresets")),
      })
    ),
  },
  handler: async (ctx, { id, fields }) => {
    const chat = await getAuthorizedChatOrThrow(ctx, { id })

    await ctx.db.patch(chat._id, {
      ...fields,
      languageModelPresetId: nullToUndefined(fields.languageModelPresetId),
      agentPresetId: nullToUndefined(fields.agentPresetId),
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
