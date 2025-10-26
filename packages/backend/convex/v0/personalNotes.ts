import { ConvexError, v } from "convex/values"
import type { Doc } from "../_generated/dataModel"
import { mutation, type QueryCtx, query } from "../_generated/server"
import { getAuthorizedUser, getAuthorizedUserOrThrow, getOrCreateAuthorizedUser } from "./users"

export type PersonalNoteDoc = Doc<"personalNotes">
export type PersonalNoteContentDoc = Doc<"personalNoteContents">

export async function getAuthorizedPersonalNoteOrThrow(ctx: QueryCtx, args: { id: string }) {
  const user = await getAuthorizedUserOrThrow(ctx)

  const noteId = ctx.db.normalizeId("personalNotes", args.id)
  if (!noteId) {
    throw new ConvexError("Invalid note id.")
  }

  const note = await ctx.db.get(noteId)

  if (!note) {
    throw new ConvexError("Note not found.")
  }

  if (note.userId !== user._id) {
    throw new ConvexError("Forbidden.")
  }

  return note
}

export async function getAuthorizedPersonalNoteContentOrThrow(ctx: QueryCtx, args: { id: string }) {
  const user = await getAuthorizedUserOrThrow(ctx)

  const contentId = ctx.db.normalizeId("personalNoteContents", args.id)
  if (!contentId) {
    throw new ConvexError("Invalid content id.")
  }

  const content = await ctx.db.get(contentId)

  if (!content) {
    throw new ConvexError("Note content not found.")
  }

  if (content.userId !== user._id) {
    throw new ConvexError("Content ownership mismatch.")
  }

  return content
}

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await getAuthorizedPersonalNoteOrThrow(ctx, args)
    const content = await getAuthorizedPersonalNoteContentOrThrow(ctx, {
      id: note.contentId,
    })

    return { ...note, content: content.content }
  },
})

export const list = query({
  handler: async (ctx) => {
    const user = await getAuthorizedUser(ctx)
    if (!user) {
      return []
    }

    const notes = await ctx.db
      .query("personalNotes")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()

    return notes
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateAuthorizedUser(ctx)

    const contentId = await ctx.db.insert("personalNoteContents", {
      content: args.content,
      userId: user._id,
    })

    const noteId = await ctx.db.insert("personalNotes", {
      userId: user._id,
      title: args.title.slice(0, 200),
      contentId,
      updatedAt: Date.now(),
    })

    return { noteId }
  },
})

export const update = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const note = await getAuthorizedPersonalNoteOrThrow(ctx, { id: args.id })

    const updates: Partial<PersonalNoteDoc> = {
      updatedAt: Date.now(),
    }

    if (args.title !== undefined) {
      updates.title = args.title.slice(0, 200)
    }
    if (args.content !== undefined) {
      await getAuthorizedPersonalNoteContentOrThrow(ctx, {
        id: note.contentId,
      })
      await ctx.db.patch(note.contentId, { content: args.content })
    }

    await ctx.db.patch(note._id, updates)
  },
})

export const del = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await getAuthorizedPersonalNoteOrThrow(ctx, args)

    await getAuthorizedPersonalNoteContentOrThrow(ctx, {
      id: note.contentId,
    })

    await ctx.db.delete(note.contentId)
    await ctx.db.delete(note._id)
  },
})
