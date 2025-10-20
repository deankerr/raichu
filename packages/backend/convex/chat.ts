import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { createAgent } from "./agent"
import { deleteThread } from "./chat/thread"
import { MAX_TITLE_LENGTH } from "./constants"
import { getCurrentUser, getOrCreateCurrentUser } from "./users"

export const create = mutation({
  args: {
    prompt: v.string(),

    modelId: v.string(),
    temperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)

    const agent = createAgent(args)

    const title =
      args.prompt.slice(0, MAX_TITLE_LENGTH) + (args.prompt.length > MAX_TITLE_LENGTH ? "..." : "")

    const { threadId } = await agent.createThread(ctx, {
      userId: user._id,
      title,
    })

    const chatId = await ctx.db.insert("chats", {
      userId: user._id,
      threadId,
      title,
      config: {
        modelId: args.modelId,
        temperature: args.temperature,
        maxOutputTokens: args.maxOutputTokens,
        name: args.name,
      },
    })

    return { chatId }
  },
})

export const get = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error("User not authenticated")
    }

    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    if (chat.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    return chat
  },
})

export const delete_ = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error("User not authenticated")
    }

    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    if (chat.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    // Delete the thread (async)
    await deleteThread(ctx, { threadId: chat.threadId })

    // Delete the chat document
    await ctx.db.delete(args.chatId)
  },
})
