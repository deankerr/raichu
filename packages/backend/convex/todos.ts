import { v } from "convex/values"
import { withSystemFields } from "convex-helpers/validators"
import type { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import schema from "./schema"

// Reusable validators for todos
const todoFields = schema.tables.todos.validator.fields
const todoWithSystemFields = withSystemFields("todos", todoFields)
const createTodoArgs = v.object({
  text: todoFields.text,
  completed: todoFields.completed,
  userId: todoFields.userId,
  listId: todoFields.listId,
  priority: todoFields.priority,
})

export const createTodos = mutation({
  args: v.object({
    todos: v.array(createTodoArgs),
  }),
  returns: v.array(v.id("todos")),
  handler: async (ctx, args) => {
    const todoIds: Id<"todos">[] = []
    for (const todo of args.todos) {
      const todoId = await ctx.db.insert("todos", todo)
      todoIds.push(todoId)
    }
    return todoIds
  },
})

type TodoDocument = {
  priority?: "low" | "medium" | "high" | null
  _creationTime: number
}

function sortByPriority(a: TodoDocument, b: TodoDocument): number {
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
  const aPriority = priorityOrder[a.priority || "medium"]
  const bPriority = priorityOrder[b.priority || "medium"]
  return bPriority - aPriority
}

export const listTodos = query({
  args: v.object({
    userId: todoFields.userId,
    listId: todoFields.listId,
    filter: v.union(v.literal("all"), v.literal("active"), v.literal("completed")),
    sortBy: v.union(v.literal("created"), v.literal("priority")),
  }),
  returns: v.array(v.object(todoWithSystemFields)),
  handler: async (ctx, args) => {
    let todos = await ctx.db
      .query("todos")
      .withIndex("by_user_and_list", (q) => q.eq("userId", args.userId).eq("listId", args.listId))
      .collect()

    // Apply filter
    if (args.filter === "active") {
      todos = todos.filter((todo) => !todo.completed)
    } else if (args.filter === "completed") {
      todos = todos.filter((todo) => todo.completed)
    }

    // Apply sorting
    todos.sort((a, b) => {
      switch (args.sortBy) {
        case "created":
          return b._creationTime - a._creationTime
        case "priority":
          return sortByPriority(a, b)
        default:
          return 0
      }
    })

    return todos
  },
})

const updateTodoArgs = v.object({
  text: v.optional(todoFields.text),
  completed: v.optional(todoFields.completed),
  priority: todoFields.priority,
  completedAt: todoFields.completedAt,
})

export const updateTodos = mutation({
  args: v.object({
    todoIds: v.array(v.id("todos")),
    userId: todoFields.userId,
    updateData: updateTodoArgs,
  }),
  returns: v.number(),
  handler: async (ctx, args) => {
    let updatedCount = 0
    for (const todoId of args.todoIds) {
      const todo = await ctx.db.get(todoId)
      if (todo && todo.userId === args.userId) {
        await ctx.db.patch(todoId, args.updateData)
        updatedCount++
      }
    }
    return updatedCount
  },
})

export const deleteTodos = mutation({
  args: v.object({
    todoIds: v.array(v.id("todos")),
    userId: todoFields.userId,
  }),
  returns: v.number(),
  handler: async (ctx, args) => {
    let deletedCount = 0
    for (const todoId of args.todoIds) {
      const todo = await ctx.db.get(todoId)
      if (todo && todo.userId === args.userId) {
        await ctx.db.delete(todoId)
        deletedCount++
      }
    }
    return deletedCount
  },
})

export const clearCompletedTodos = mutation({
  args: v.object({
    userId: todoFields.userId,
    listId: todoFields.listId,
  }),
  returns: v.number(),
  handler: async (ctx, args) => {
    const completedTodos = await ctx.db
      .query("todos")
      .withIndex("by_user_and_list", (q) => q.eq("userId", args.userId).eq("listId", args.listId))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect()

    let deletedCount = 0
    for (const todo of completedTodos) {
      await ctx.db.delete(todo._id)
      deletedCount++
    }

    return deletedCount
  },
})

export const toggleAllTodos = mutation({
  args: v.object({
    userId: todoFields.userId,
    listId: todoFields.listId,
    completed: v.boolean(),
  }),
  returns: v.number(),
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user_and_list", (q) => q.eq("userId", args.userId).eq("listId", args.listId))
      .collect()

    let updatedCount = 0
    const now = Date.now()
    for (const todo of todos) {
      await ctx.db.patch(todo._id, {
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
      })
      updatedCount++
    }

    return updatedCount
  },
})

export const reorderTodos = mutation({
  args: v.object({
    userId: todoFields.userId,
    listId: todoFields.listId,
    todoIds: v.array(v.id("todos")),
  }),
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Verify all todos belong to the user and list
    for (const todoId of args.todoIds) {
      const todo = await ctx.db.get(todoId)
      if (!todo || todo.userId !== args.userId || todo.listId !== args.listId) {
        return false
      }
    }

    // In a real implementation, you might want to store an order field
    // For now, this validates the reordering operation
    return true
  },
})
