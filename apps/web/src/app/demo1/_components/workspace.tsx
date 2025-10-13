import { type LucideIcon, MessageSquareIcon, MessagesSquareIcon } from "lucide-react"
import React, { createContext, type JSX, use, useReducer } from "react"
import { Chat } from "./chat/chat"
import { ThreadExplorer } from "./thread-explorer/thread-explorer"

// Core Types
type TabArea = "left" | "main"

type WorkspaceComponentDef = {
  componentId: string
  // biome-ignore lint/suspicious/noExplicitAny: todo
  component: (props: any) => JSX.Element
  icon: LucideIcon
  componentName: string
}

type WorkspaceInstanceData = {
  instanceId: string
  title: string // Title to display in the tab
  props?: Record<string, unknown> // Props to pass to the component
}

type WorkspaceTab = WorkspaceComponentDef & WorkspaceInstanceData

type WorkspaceState = {
  tabs: Record<TabArea, WorkspaceTab[]>
  activeTabIds: Record<TabArea, string | null>
}

// Component Registry
const componentRegistry: Record<string, WorkspaceComponentDef> = {
  threads: {
    componentId: "threads",
    component: ThreadExplorer,
    icon: MessagesSquareIcon,
    componentName: "Threads",
  },
  chat: {
    componentId: "chat",
    component: Chat,
    icon: MessageSquareIcon,
    componentName: "Chat",
  },
}

// Action Types
type WorkspaceAction =
  | {
      type: "ADD_TAB"
      area: TabArea
      componentId: string
      tab: Partial<Omit<WorkspaceInstanceData, "instanceId">>
    }
  | { type: "REMOVE_TAB"; instanceId: string }
  | { type: "FOCUS_TAB"; instanceId: string }
  | {
      type: "UPDATE_TAB_TITLE"
      instanceId: string
      title: string
    }
  | {
      type: "UPDATE_TAB_PROPS"
      instanceId: string
      props: Record<string, unknown>
    }

function generateInstanceId(componentId: string) {
  // biome-ignore lint/style/noMagicNumbers: random int
  return `${componentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper Functions
function createTab(
  componentId: string,
  tab: Partial<Omit<WorkspaceInstanceData, "instanceId">>
): WorkspaceTab {
  const def = componentRegistry[componentId]
  if (!def) {
    throw new Error(`Unknown component: ${componentId}`)
  }

  return {
    ...def,
    ...tab,
    title: tab.title ?? def.componentName,
    instanceId: generateInstanceId(componentId),
  }
}

function findTabLocation(
  state: WorkspaceState,
  instanceId: string
): { area: TabArea; index: number } | null {
  for (const area of ["left", "main"] as TabArea[]) {
    const index = state.tabs[area].findIndex((t) => t.instanceId === instanceId)
    if (index !== -1) {
      return { area, index }
    }
  }
  return null
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "ADD_TAB": {
      const newTab = createTab(action.componentId, action.tab)
      const area = action.area

      return {
        ...state,
        tabs: {
          ...state.tabs,
          [area]: [...state.tabs[area], newTab],
        },
        activeTabIds: {
          ...state.activeTabIds,
          [area]: newTab.instanceId, // Auto-focus new tabs
        },
      }
    }

    case "REMOVE_TAB": {
      const location = findTabLocation(state, action.instanceId)
      if (!location) {
        return state
      }

      const { area, index } = location
      const newTabs = state.tabs[area].filter((t) => t.instanceId !== action.instanceId)

      // Handle active tab change if we're removing the active tab
      let newActiveId = state.activeTabIds[area]
      if (newActiveId === action.instanceId) {
        // Try to activate the next tab, or previous if at end
        newActiveId = newTabs[Math.min(index, newTabs.length - 1)]?.instanceId || null
      }

      return {
        ...state,
        tabs: {
          ...state.tabs,
          [area]: newTabs,
        },
        activeTabIds: {
          ...state.activeTabIds,
          [area]: newActiveId,
        },
      }
    }

    case "FOCUS_TAB": {
      const location = findTabLocation(state, action.instanceId)
      if (!location) {
        return state
      }

      return {
        ...state,
        activeTabIds: {
          ...state.activeTabIds,
          [location.area]: action.instanceId,
        },
      }
    }

    case "UPDATE_TAB_TITLE": {
      const location = findTabLocation(state, action.instanceId)
      if (!location) {
        return state
      }

      const { area } = location
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [area]: state.tabs[area].map((tab) =>
            tab.instanceId === action.instanceId ? { ...tab, title: action.title } : tab
          ),
        },
      }
    }

    case "UPDATE_TAB_PROPS": {
      const location = findTabLocation(state, action.instanceId)
      if (!location) {
        return state
      }

      const { area } = location
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [area]: state.tabs[area].map((tab) =>
            tab.instanceId === action.instanceId
              ? { ...tab, props: { ...tab.props, ...action.props } }
              : tab
          ),
        },
      }
    }

    default:
      return state
  }
}

// Initial State
function createInitialState(): WorkspaceState {
  const threadsTab = createTab("threads", {})

  return {
    tabs: {
      left: [threadsTab],
      main: [],
    },
    activeTabIds: {
      left: threadsTab.instanceId,
      main: null,
    },
  }
}

// Context & Provider
const WorkspaceContext = createContext<{
  state: WorkspaceState
  dispatch: React.Dispatch<WorkspaceAction>
  getTab: (instanceId: string) => WorkspaceTab | undefined
  getActiveTab: (area: TabArea) => WorkspaceTab | undefined
} | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createInitialState)

  const getTab = (instanceId: string) => {
    for (const area of ["left", "main"] as TabArea[]) {
      const tab = state.tabs[area].find((t) => t.instanceId === instanceId)
      if (tab) {
        return tab
      }
    }
    return
  }

  const getActiveTab = (area: TabArea) => {
    const activeId = state.activeTabIds[area]
    if (!activeId) {
      return
    }
    return state.tabs[area].find((t) => t.instanceId === activeId)
  }

  return (
    <WorkspaceContext
      value={{
        state,
        dispatch,
        getTab,
        getActiveTab,
      }}
    >
      {children}
    </WorkspaceContext>
  )
}

export function useWorkspace() {
  const context = use(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  }
  return context
}

// Export types for consumers
export type { WorkspaceTab, WorkspaceState, TabArea, WorkspaceAction }
