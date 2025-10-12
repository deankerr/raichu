import { createTool } from "@convex-dev/agent"
import { z } from "zod"
import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

// Todo List Management Tools
export const createTodoList = createTool({
  description: "Create a new todo list",
  args: z.object({
    name: z.string().describe("The name of the todo list"),
    description: z.string().optional().describe("Optional description of the todo list"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    listId: string
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to create todo lists")
    }

    const listId: string = await ctx.runMutation(api.todoLists.createTodoList, {
      name: args.name,
      userId,
      description: args.description,
    })

    return {
      success: true,
      listId,
      message: `Created todo list "${args.name}"`,
    }
  },
})

export const listTodoLists = createTool({
  description: "List all todo lists for the current user",
  args: z.object({}),
  handler: async (
    ctx
  ): Promise<{
    lists: Array<{
      id: string
      name: string
      description: string | null
      createdAt: string
      updatedAt: string
    }>
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to list todo lists")
    }

    const lists = await ctx.runQuery(api.todoLists.listTodoLists, { userId })

    if (lists.length === 0) {
      return {
        lists: [],
        message: "No todo lists found",
      }
    }

    const formattedLists = lists.map((list) => ({
      id: list._id,
      name: list.name,
      description: list.description || null,
      createdAt: new Date(list._creationTime).toLocaleDateString(),
      updatedAt: new Date(list.updatedAt || list._creationTime).toLocaleDateString(),
    }))

    return {
      lists: formattedLists,
      message: `Found ${lists.length} todo list(s)`,
    }
  },
})

export const deleteTodoList = createTool({
  description: "Delete a todo list and all its todos",
  args: z.object({
    listId: z.string().describe("The ID of the todo list to delete"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to delete todo lists")
    }

    const success = await ctx.runMutation(api.todoLists.deleteTodoList, {
      listId: args.listId as Id<"todoLists">,
      userId,
    })

    if (!success) {
      return {
        success: false,
        message: "Todo list not found or you don't have permission to delete it",
      }
    }

    return {
      success: true,
      message: `Deleted todo list ${args.listId}`,
    }
  },
})

// Todo Item Management Tools
export const createTodos = createTool({
  description: "Create multiple todo items in a specific list",
  args: z.object({
    listId: z.string().describe("The ID of the todo list to add the todos to"),
    todos: z
      .array(
        z.object({
          text: z.string().describe("The todo item text/description"),
          priority: z
            .enum(["low", "medium", "high"])
            .optional()
            .describe("Priority level: low, medium, or high"),
        })
      )
      .describe("Array of todos to create"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    todoIds: string[]
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to create todos")
    }

    const todoData = args.todos.map((todo) => ({
      text: todo.text,
      completed: false,
      userId,
      listId: args.listId as Id<"todoLists">,
      priority: todo.priority || "medium",
    }))

    const todoIds: string[] = await ctx.runMutation(api.todos.createTodos, { todos: todoData })

    return {
      success: true,
      todoIds,
      message: `Created ${todoIds.length} todo(s) in list`,
    }
  },
})

export const listTodos = createTool({
  description: "List all todos in a specific todo list",
  args: z.object({
    listId: z.string().describe("The ID of the todo list to list todos from"),
    filter: z
      .enum(["all", "active", "completed"])
      .optional()
      .describe("Filter todos: all, active, or completed"),
    sortBy: z.enum(["created", "priority"]).optional().describe("Sort by: created or priority"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    todos: Array<{
      id: string
      text: string
      completed: boolean
      priority: string
      createdAt: string
      completedAt: string | null
    }>
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to list todos")
    }

    const todos = await ctx.runQuery(api.todos.listTodos, {
      userId,
      listId: args.listId as Id<"todoLists">,
      filter: args.filter || "all",
      sortBy: args.sortBy || "created",
    })

    if (todos.length === 0) {
      return {
        todos: [],
        message: "No todos found in this list",
      }
    }

    const formattedTodos = todos.map((todo) => ({
      id: todo._id,
      text: todo.text,
      completed: todo.completed,
      priority: todo.priority || "medium",
      createdAt: new Date(todo._creationTime).toLocaleDateString(),
      completedAt: todo.completedAt ? new Date(todo.completedAt).toLocaleDateString() : null,
    }))

    return {
      todos: formattedTodos,
      message: `Found ${todos.length} todo(s) in this list`,
    }
  },
})

export const updateTodos = createTool({
  description: "Update multiple todo items at once",
  args: z.object({
    todoIds: z.array(z.string()).describe("Array of todo IDs to update"),
    text: z.string().optional().describe("New text for all todo items"),
    completed: z.boolean().optional().describe("Mark all as completed or not"),
    priority: z
      .enum(["low", "medium", "high"])
      .optional()
      .describe("New priority level for all todos"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    updatedCount: number
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to update todos")
    }

    const updateData: Record<string, unknown> = {}

    if (args.text !== undefined) {
      updateData.text = args.text
    }
    if (args.completed !== undefined) {
      updateData.completed = args.completed
      updateData.completedAt = args.completed ? Date.now() : undefined
    }
    if (args.priority !== undefined) {
      updateData.priority = args.priority
    }

    const updatedCount: number = await ctx.runMutation(api.todos.updateTodos, {
      todoIds: args.todoIds as Id<"todos">[],
      userId,
      updateData,
    })

    return {
      success: true,
      updatedCount,
      message: `Updated ${updatedCount} todo(s)`,
    }
  },
})

export const deleteTodos = createTool({
  description: "Delete multiple todo items at once",
  args: z.object({
    todoIds: z.array(z.string()).describe("Array of todo IDs to delete"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    deletedCount: number
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to delete todos")
    }

    const deletedCount: number = await ctx.runMutation(api.todos.deleteTodos, {
      todoIds: args.todoIds as Id<"todos">[],
      userId,
    })

    return {
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} todo(s)`,
    }
  },
})

export const toggleAllTodos = createTool({
  description: "Mark all todos in a list as completed or active",
  args: z.object({
    listId: z.string().describe("The ID of the todo list"),
    completed: z.boolean().describe("Whether to mark all as completed (true) or active (false)"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    updatedCount: number
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to update todos")
    }

    const updatedCount: number = await ctx.runMutation(api.todos.toggleAllTodos, {
      userId,
      listId: args.listId as Id<"todoLists">,
      completed: args.completed,
    })

    return {
      success: true,
      updatedCount,
      message: `Marked ${updatedCount} todo(s) as ${args.completed ? "completed" : "active"}`,
    }
  },
})

export const clearCompletedTodos = createTool({
  description: "Delete all completed todos in a specific todo list",
  args: z.object({
    listId: z.string().describe("The ID of the todo list to clear completed todos from"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    deletedCount: number
    message: string
  }> => {
    const { userId } = ctx

    if (!userId) {
      throw new Error("User ID is required to clear todos")
    }

    const deletedCount: number = (await ctx.runMutation(api.todos.clearCompletedTodos, {
      userId,
      listId: args.listId as Id<"todoLists">,
    })) as number

    return {
      success: true,
      deletedCount,
      message: `Cleared ${deletedCount} completed todo(s) from this list`,
    }
  },
})

export const todoTools = {
  // List management
  createTodoList,
  listTodoLists,
  deleteTodoList,

  createTodos,
  updateTodos,
  deleteTodos,
  toggleAllTodos,
} as const
