import {
  listMessages,
  saveMessage,
  syncStreams,
  toUIMessages,
  vStreamArgs,
} from "@convex-dev/agent"
import { paginationOptsValidator } from "convex/server"
import { ConvexError, v } from "convex/values"
import { components, internal } from "../_generated/api"
import { mutation, query } from "../_generated/server"
import { getAuthorizedChatOrThrow } from "./chats"
import { getAuthorizedUserOrThrow } from "./users"

export const list = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    // TODO authorize

    // NOTE: we don't use the agents listUIMessages method because it removes the model id
    const messageDocs = await listMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    })

    const uiMessages = {
      ...messageDocs,
      // convert to UI messages
      page: toUIMessages(
        // enrich UI messages with provider model
        messageDocs.page.map((m) => {
          if (m.providerMetadata?.openrouter) {
            m.providerMetadata.openrouter.model = m.model
          }
          return m
        })
      ),
    }

    // * include active streaming responses
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    })

    return {
      ...uiMessages,
      streams,
    }
  },
})

export const create = mutation({
  args: {
    chatId: v.id("chats_v0"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await getAuthorizedChatOrThrow(ctx, { id: args.chatId })

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: chat.threadId,
      userId: chat.userId,
      prompt: args.content,
    })

    return { messageId }
  },
})

export const send = mutation({
  args: {
    chatId: v.id("chats_v0"),
    content: v.string(),

    modelId: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const chat = await getAuthorizedChatOrThrow(ctx, { id: args.chatId })

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: chat.threadId,
      userId: chat.userId,
      prompt: args.content,
    })

    const user = await getAuthorizedUserOrThrow(ctx)

    await ctx.scheduler.runAfter(0, internal.v0.agents.streamResponseAsync, {
      userSubject: user.subject,
      threadId: chat.threadId,
      promptMessageId: messageId,
    })

    return { messageId }
  },
})

export const del = mutation({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthorizedUserOrThrow(ctx)
    const messageIds = [args.messageId]
    const messages = await ctx.runQuery(components.agent.messages.getMessagesByIds, { messageIds })

    if (messages.every((m) => m?.userId !== user._id)) {
      throw new ConvexError("Forbidden.")
    }

    await ctx.runMutation(components.agent.messages.deleteByIds, { messageIds })
  },
})
