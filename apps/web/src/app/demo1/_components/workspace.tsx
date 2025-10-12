import { type LucideIcon, MessageSquareIcon, MessagesSquareIcon } from "lucide-react"
import React, { createContext, type JSX, use, useCallback, useReducer } from "react"
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
  singleton?: boolean // Only one instance allowed
}

type WorkspaceInstanceData = {
  instanceId: string
  title: string // Title to display in the tab
  props?: Record<string, unknown> // Props to pass to the component
  metadata?: Record<string, unknown> // Additional tab metadata
}

type WorkspaceTab = WorkspaceComponentDef & WorkspaceInstanceData

type WorkspaceState = {
  tabs: Record<TabArea, WorkspaceTab[]>
  activeTabIds: Record<TabArea, string | null>
  tabHistory: string[] // Track tab focus history for navigation
}

// Component Registry
const componentRegistry: Record<string, WorkspaceComponentDef> = {
  threads: {
    componentId: "threads",
    component: ThreadExplorer,
    icon: MessagesSquareIcon,
    componentName: "Threads",
    singleton: true,
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
  | { type: "MOVE_TAB"; instanceId: string; toArea: TabArea; toIndex?: number }
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
  | {
      type: "UPDATE_TAB_METADATA"
      instanceId: string
      metadata: Record<string, unknown>
    }
  | { type: "CLOSE_ALL_IN_AREA"; area: TabArea }
  | { type: "FOCUS_PREVIOUS_TAB" }
  | { type: "SWAP_TABS"; instanceId1: string; instanceId2: string }

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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: im a boss
function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "ADD_TAB": {
      const newTab = createTab(action.componentId, action.tab)

      // Check singleton constraint
      if (newTab.singleton) {
        for (const area of ["left", "main"] as TabArea[]) {
          const existing = state.tabs[area].find((t) => t.componentId === action.componentId)
          if (existing) {
            // Just focus the existing singleton
            return workspaceReducer(state, {
              type: "FOCUS_TAB",
              instanceId: existing.instanceId,
            })
          }
        }
      }

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
        tabHistory: [...state.tabHistory, newTab.instanceId],
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
        tabHistory: state.tabHistory.filter((id) => id !== action.instanceId),
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
        tabHistory: [
          ...state.tabHistory.filter((id) => id !== action.instanceId),
          action.instanceId,
        ],
      }
    }

    case "MOVE_TAB": {
      const location = findTabLocation(state, action.instanceId)
      if (!location) {
        return state
      }

      const { area: fromArea } = location
      const tab = state.tabs[fromArea].find((t) => t.instanceId === action.instanceId)
      if (!tab) {
        return state
      }

      const fromTabs = state.tabs[fromArea].filter((t) => t.instanceId !== action.instanceId)
      const toTabs = [...state.tabs[action.toArea]]

      // Insert at specific index or append
      if (action.toIndex !== undefined && action.toIndex >= 0) {
        toTabs.splice(action.toIndex, 0, tab)
      } else {
        toTabs.push(tab)
      }

      // Update active tabs
      const newActiveIds = { ...state.activeTabIds }
      if (fromArea === action.toArea) {
        // Moving within same area, maintain focus
      } else {
        // Moving to different area
        if (newActiveIds[fromArea] === action.instanceId) {
          newActiveIds[fromArea] = fromTabs[0]?.instanceId || null
        }
        newActiveIds[action.toArea] = action.instanceId
      }

      return {
        ...state,
        tabs: {
          ...state.tabs,
          [fromArea]: fromTabs,
          [action.toArea]: toTabs,
        },
        activeTabIds: newActiveIds,
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

    case "UPDATE_TAB_METADATA": {
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
              ? { ...tab, metadata: { ...tab.metadata, ...action.metadata } }
              : tab
          ),
        },
      }
    }

    case "CLOSE_ALL_IN_AREA": {
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.area]: [],
        },
        activeTabIds: {
          ...state.activeTabIds,
          [action.area]: null,
        },
        tabHistory: state.tabHistory.filter(
          (id) => !state.tabs[action.area].some((t) => t.instanceId === id)
        ),
      }
    }

    case "FOCUS_PREVIOUS_TAB": {
      const previousId = state.tabHistory.at(-2)
      if (!previousId) {
        return state
      }
      return workspaceReducer(state, {
        type: "FOCUS_TAB",
        instanceId: previousId,
      })
    }

    case "SWAP_TABS": {
      const loc1 = findTabLocation(state, action.instanceId1)
      const loc2 = findTabLocation(state, action.instanceId2)
      if (!(loc1 && loc2)) {
        return state
      }

      const newTabs = { ...state.tabs }

      if (loc1.area === loc2.area) {
        // Swapping within same area
        const area = loc1.area
        const tabs = [...state.tabs[area]]
        ;[tabs[loc1.index], tabs[loc2.index]] = [tabs[loc2.index], tabs[loc1.index]]
        newTabs[area] = tabs
      } else {
        // Swapping between areas
        const tab1 = state.tabs[loc1.area][loc1.index]
        const tab2 = state.tabs[loc2.area][loc2.index]

        newTabs[loc1.area] = [...state.tabs[loc1.area]]
        newTabs[loc2.area] = [...state.tabs[loc2.area]]
        newTabs[loc1.area][loc1.index] = tab2
        newTabs[loc2.area][loc2.index] = tab1
      }

      return { ...state, tabs: newTabs }
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
    tabHistory: [threadsTab.instanceId],
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

  const getTab = useCallback(
    (instanceId: string) => {
      for (const area of ["left", "main"] as TabArea[]) {
        const tab = state.tabs[area].find((t) => t.instanceId === instanceId)
        if (tab) {
          return tab
        }
      }
      return
    },
    [state.tabs]
  )

  const getActiveTab = useCallback(
    (area: TabArea) => {
      const activeId = state.activeTabIds[area]
      if (!activeId) {
        return
      }
      return state.tabs[area].find((t) => t.instanceId === activeId)
    },
    [state.tabs, state.activeTabIds]
  )

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
