import { createContext, type ReactNode, useContext, useState } from "react"
import { useArrayState } from "rooks"
import { cleanupTabLocalState } from "./chat/state"

export type WorkspaceTab = {
  tabId: string
  componentType: string
  componentId: string
  title: string
}

function generateTabId() {
  return crypto.randomUUID()
}

type WorkspaceContextValue = {
  tabs: WorkspaceTab[]
  activeTab: WorkspaceTab | null
  activeTabId: string | null
  sidebarTab: "chats" | "notes"
  controls: {
    addTab: (args: {
      componentType: string
      componentId: string
      title: string
      setActive?: boolean
    }) => string
    removeTab: (tabId: string) => void
    updateTab: (tabId: string, updates: Partial<Omit<WorkspaceTab, "tabId">>) => void
    setActiveTab: (tabId: string | null) => void
    setSidebarTab: (tab: "chats" | "notes") => void
  }
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [tabs, tabControls] = useArrayState<WorkspaceTab>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [sidebarTab, setSidebarTab] = useState<"chats" | "notes">("chats")

  const addTab = (args: {
    componentType: string
    componentId: string
    title: string
    setActive?: boolean
  }) => {
    const tabId = generateTabId()
    const newTab: WorkspaceTab = {
      tabId,
      componentType: args.componentType,
      componentId: args.componentId,
      title: args.title,
    }

    tabControls.push(newTab)

    if (args.setActive ?? true) {
      setActiveTabId(tabId)
    }

    return tabId
  }

  const removeTab = (tabId: string) => {
    const index = tabs.findIndex((t) => t.tabId === tabId)
    if (index === -1) return

    const tab = tabs[index]
    const isActive = activeTabId === tabId

    tabControls.removeItemAtIndex(index)

    // Cleanup orphaned new-chat state (for existing chats, state persists via chatId)
    if (tab.componentType === "new-chat") {
      cleanupTabLocalState(tab.tabId)
    }

    // Handle active tab change after removal
    if (isActive) {
      // Try next tab (at same index after removal)
      if (tabs[index + 1]) {
        setActiveTabId(tabs[index + 1].tabId)
      } else if (tabs[index - 1]) {
        // Try previous tab
        setActiveTabId(tabs[index - 1].tabId)
      } else {
        // No tabs left
        setActiveTabId(null)
      }
    }
  }

  const updateTab = (tabId: string, updates: Partial<Omit<WorkspaceTab, "tabId">>) => {
    const index = tabs.findIndex((tab) => tab.tabId === tabId)
    if (index === -1) return

    const updatedTab: WorkspaceTab = {
      ...tabs[index],
      ...updates,
      tabId: tabs[index].tabId, // Ensure tabId cannot be changed
    }

    tabControls.replaceItemAtIndex(index, updatedTab)
  }

  const setActiveTab = (tabId: string | null) => {
    if (tabId === null) {
      setActiveTabId(null)
      return
    }

    if (tabs.some((tab) => tab.tabId === tabId)) {
      setActiveTabId(tabId)
    }
  }

  // Derive active tab from tabs and activeTabId
  const activeTab = tabs.find((tab) => tab.tabId === activeTabId) ?? null

  return (
    <WorkspaceContext
      value={{
        tabs,
        activeTab,
        activeTabId,
        sidebarTab,
        controls: {
          addTab,
          removeTab,
          updateTab,
          setActiveTab,
          setSidebarTab,
        },
      }}
    >
      {children}
    </WorkspaceContext>
  )
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace2Context must be used within Workspace2Provider")
  }
  return context
}
