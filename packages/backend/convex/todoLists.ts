import { v } from "convex/values"
import { withSystemFields } from "convex-helpers/validators"
import { mutation, query } from "./_generated/server"
import schema from "./schema"

// Reusable validators for todoLists
const todoListFields = schema.tables.todoLists.validator.fields
const todoListWithSystemFields = withSystemFields("todoLists", todoListFields)
const createTodoListArgs = v.object({
  name: todoListFields.name,
  userId: todoListFields.userId,
  description: todoListFields.description,
})
const updateTodoListArgs = v.object({
  name: v.optional(todoListFields.name),
  description: todoListFields.description,
})

export const createTodoList = mutation({
  args: createTodoListArgs,
  returns: v.id("todoLists"),
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert("todoLists", {
      ...args,
      updatedAt: now,
    })
  },
})

export const listTodoLists = query({
  args: v.object({ userId: todoListFields.userId }),
  returns: v.array(v.object(todoListWithSystemFields)),
  handler: async (ctx, args) =>
    await ctx.db
      .query("todoLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect(),
})

export const getTodoList = query({
  args: v.object({
    listId: v.id("todoLists"),
    userId: todoListFields.userId,
  }),
  returns: v.union(v.object(todoListWithSystemFields), v.null()),
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== args.userId) {
      return null
    }
    return list
  },
})

export const updateTodoList = mutation({
  args: v.object({
    listId: v.id("todoLists"),
    userId: todoListFields.userId,
    updateData: updateTodoListArgs,
  }),
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== args.userId) {
      return false
    }

    await ctx.db.patch(args.listId, {
      ...args.updateData,
      updatedAt: Date.now(),
    })
    return true
  },
})

export const deleteTodoList = mutation({
  args: v.object({
    listId: v.id("todoLists"),
    userId: todoListFields.userId,
  }),
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId)
    if (!list || list.userId !== args.userId) {
      return false
    }

    // Delete all todos in this list first
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect()

    for (const todo of todos) {
      await ctx.db.delete(todo._id)
    }

    // Delete the list
    await ctx.db.delete(args.listId)
    return true
  },
})
