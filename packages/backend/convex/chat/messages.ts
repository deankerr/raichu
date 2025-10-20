import { listMessages, syncStreams, toUIMessages, vStreamArgs } from "@convex-dev/agent"
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { components } from "../_generated/api"
import { query } from "../_generated/server"

export const list = query({
  args: {
    threadId: v.string(),
    // Pagination options for the non-streaming messages.
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
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
