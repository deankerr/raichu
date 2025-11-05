import { type LucideIcon, MessagesSquareIcon } from "lucide-react"
import { nanoid } from "nanoid"
import { create } from "zustand"

export type View = {
  id: string // Unique identifier for this instance (nanoid)
  kind: string // Determines which View component to render ('markdown', 'chat', etc.)
  resourceId: string | undefined // undefined for new/unsaved resources
  label: string
  icon: LucideIcon
}

/**
 * State for an WorkspaceArea
 * Both Sidebar and Main area use this same structure
 */
type WorkspaceAreaState = {
  views: View[]
  activeViewId: string | null
}

/**
 * Root workspace state
 */
type WorkspaceState = {
  sidebar: WorkspaceAreaState & {
    isVisible: boolean
  }
  main: WorkspaceAreaState
}

/**
 * Commands that modify workspace state
 * These are methods on the store
 */
type WorkspaceActions = {
  // === Sidebar Commands ===

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar: (visible?: boolean) => void

  /**
   * Open or reveal a resource in the sidebar
   * If already open, activate it. Otherwise, create new tab.
   * resourceId can be undefined for new/unsaved resources
   */
  openInSidebar: (
    kind: string,
    resourceId: string | undefined,
    label: string,
    icon: LucideIcon
  ) => void

  // === Main Area Commands ===

  /**
   * Open or reveal a resource in the main area
   * If already open, activate it. Otherwise, create new tab.
   * resourceId can be undefined for new/unsaved resources
   */
  openInMain: (
    kind: string,
    resourceId: string | undefined,
    label: string,
    icon: LucideIcon
  ) => void

  // === Generic View Commands ===

  /**
   * Close a specific tab by id
   * Automatically searches both areas to find the view.
   * Should activate the next appropriate tab if closing the active one
   */
  closeView: (id: string) => void

  /**
   * Close all views for a given resourceId across all editor groups
   * Used when a resource is deleted
   */
  closeResource: (resourceId: string) => void

  /**
   * Set the active tab in an area
   * Automatically searches both areas to find the view.
   */
  setActiveView: (id: string) => void

  /**
   * Update a view's properties (except id)
   * Used when a view's properties need to be updated (e.g., label, resourceId)
   */
  updateView: (viewId: string, updates: Partial<Omit<View, "id">>) => void

  /**
   * Reorder views within an area (for drag-and-drop)
   */
  // NOTE: not required yet
  // reorderViews: (area: 'sidebar' | 'main', fromIndex: number, toIndex: number) => void

  // === Query Methods (optional - can also use selectors) ===

  /**
   * Find which area(s) and tab(s) have a resource open
   * Returns array of locations: [{ area: 'main', id: '...' }, ...]
   */
  findViewLocations: (resourceId: string) => Array<{ area: "sidebar" | "main"; id: string }>
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

/**
 * Helper function to close a view in a specific area
 * Extracted to reduce complexity
 */
function closeViewInArea(
  state: WorkspaceState,
  area: "sidebar" | "main",
  id: string,
  viewIndex: number
): WorkspaceState {
  const areaState = state[area]
  const newViews = areaState.views.filter((v) => v.id !== id)
  let newActiveViewId = areaState.activeViewId

  // If we're closing the active view, determine the new active view
  if (areaState.activeViewId === id) {
    if (newViews.length === 0) {
      // No views left
      newActiveViewId = null
    } else if (viewIndex < newViews.length) {
      // Prefer the view to the right (same index after removal)
      newActiveViewId = newViews[viewIndex].id
    } else {
      // Fall back to the rightmost view
      newActiveViewId = newViews.at(-1)!.id
    }
  }

  return {
    ...state,
    [area]: {
      ...areaState,
      views: newViews,
      activeViewId: newActiveViewId,
    },
  }
}

/**
 * Main workspace store
 * Manages all EditorGroup state and tab lifecycle
 */
export const useWorkspace = create<WorkspaceStore>((set, get) => ({
  // === Initial State ===
  sidebar: (() => {
    const initialView = {
      id: nanoid(),
      kind: "chats-menu",
      resourceId: "chats-menu",
      label: "Chats",
      icon: MessagesSquareIcon,
    }
    return {
      views: [initialView],
      activeViewId: initialView.id,
      isVisible: true,
    }
  })(),
  main: {
    views: [],
    activeViewId: null,
  },

  // === Actions ===

  toggleSidebar: (visible) => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        isVisible: visible !== undefined ? visible : !state.sidebar.isVisible,
      },
    }))
  },

  openInSidebar: (kind, resourceId, label, icon) => {
    const state = get()
    // Only try to find existing view if resourceId is defined
    const existingView = resourceId
      ? state.sidebar.views.find((v) => v.resourceId === resourceId && v.kind === kind)
      : undefined

    if (existingView) {
      // View already exists, just activate it
      set((s) => ({
        sidebar: {
          ...s.sidebar,
          activeViewId: existingView.id,
        },
      }))
    } else {
      // Create new view (always create new for undefined resourceId)
      const newView: View = {
        id: nanoid(),
        kind,
        resourceId,
        label,
        icon,
      }

      set((s) => ({
        sidebar: {
          ...s.sidebar,
          views: [...s.sidebar.views, newView],
          activeViewId: newView.id,
        },
      }))
    }
  },

  openInMain: (kind, resourceId, label, icon) => {
    const state = get()
    // Only try to find existing view if resourceId is defined
    const existingView = resourceId
      ? state.main.views.find((v) => v.resourceId === resourceId && v.kind === kind)
      : undefined

    if (existingView) {
      // View already exists, just activate it
      set((s) => ({
        main: {
          ...s.main,
          activeViewId: existingView.id,
        },
      }))
    } else {
      // Create new view (always create new for undefined resourceId)
      const newView: View = {
        id: nanoid(),
        kind,
        resourceId,
        label,
        icon,
      }

      set((s) => ({
        main: {
          ...s.main,
          views: [...s.main.views, newView],
          activeViewId: newView.id,
        },
      }))
    }
  },

  closeView: (id) => {
    set((state) => {
      // Find which area contains the view
      let area: "sidebar" | "main" | null = null
      let viewIndex = state.sidebar.views.findIndex((v) => v.id === id)

      if (viewIndex !== -1) {
        area = "sidebar"
      } else {
        viewIndex = state.main.views.findIndex((v) => v.id === id)
        if (viewIndex !== -1) {
          area = "main"
        }
      }

      if (area === null) {
        // View not found in either area, no changes
        return state
      }

      return closeViewInArea(state, area, id, viewIndex)
    })
  },

  closeResource: (resourceId) => {
    const state = get()
    const locations = state.findViewLocations(resourceId)

    // Close all views for this resource
    for (const { id } of locations) {
      state.closeView(id)
    }
  },

  setActiveView: (id) => {
    set((state) => {
      // Find which area contains the view
      let area: "sidebar" | "main" | null = null

      if (state.sidebar.views.some((v) => v.id === id)) {
        area = "sidebar"
      } else if (state.main.views.some((v) => v.id === id)) {
        area = "main"
      }

      if (area === null) {
        // View doesn't exist in either area, no changes
        return state
      }

      const areaState = state[area]

      return {
        ...state,
        [area]: {
          ...areaState,
          activeViewId: id,
        },
      }
    })
  },

  findViewLocations: (resourceId) => {
    const state = get()
    const locations: Array<{ area: "sidebar" | "main"; id: string }> = []

    // Search sidebar
    for (const view of state.sidebar.views) {
      if (view.resourceId === resourceId) {
        locations.push({ area: "sidebar", id: view.id })
      }
    }

    // Search main
    for (const view of state.main.views) {
      if (view.resourceId === resourceId) {
        locations.push({ area: "main", id: view.id })
      }
    }

    return locations
  },

  updateView: (viewId, updates) => {
    set((state) => {
      // Find which area contains the view
      let area: "sidebar" | "main" | null = null
      let viewIndex = state.sidebar.views.findIndex((v) => v.id === viewId)

      if (viewIndex !== -1) {
        area = "sidebar"
      } else {
        viewIndex = state.main.views.findIndex((v) => v.id === viewId)
        if (viewIndex !== -1) {
          area = "main"
        }
      }

      if (area === null) {
        // View not found in either area, no changes
        return state
      }

      const areaState = state[area]
      const updatedViews = [...areaState.views]
      updatedViews[viewIndex] = {
        ...updatedViews[viewIndex],
        ...updates,
      }

      return {
        ...state,
        [area]: {
          ...areaState,
          views: updatedViews,
        },
      }
    })
  },
}))

/**
 * Selectors for common queries
 * Use these for efficient subscriptions to specific state slices
 */
export const workspaceSelectors = {
  // Get all views in main area
  mainViews: (state: WorkspaceStore) => state.main.views,

  // Get active tab in main area
  activeMainView: (state: WorkspaceStore) =>
    state.main.views.find((t) => t.id === state.main.activeViewId),

  // Get all views in sidebar
  sidebarViews: (state: WorkspaceStore) => state.sidebar.views,

  // Get active tab in sidebar
  activeSidebarView: (state: WorkspaceStore) =>
    state.sidebar.views.find((t) => t.id === state.sidebar.activeViewId),

  // Check if sidebar is visible
  isSidebarVisible: (state: WorkspaceStore) => state.sidebar.isVisible,

  // Get tab by ID (searches both areas)
  findView: (id: string) => (state: WorkspaceStore) =>
    state.main.views.find((t) => t.id === id) || state.sidebar.views.find((t) => t.id === id),
}

/**
 * Hook for Views to request workspace actions
 * Views use these commands without knowing which EditorGroup they're in
 */
export const useWorkspaceCommands = () => {
  const closeResource = useWorkspace((state) => state.closeResource)
  const openInMain = useWorkspace((state) => state.openInMain)
  const findViewLocations = useWorkspace((state) => state.findViewLocations)
  const updateView = useWorkspace((state) => state.updateView)

  return {
    /**
     * Request that all views for the current resource be closed
     * Typically called after deleting a resource
     */
    requestClose: (resourceId: string) => closeResource(resourceId),

    /**
     * Request that a resource be opened/revealed
     * Typically called when navigating to a linked resource
     */
    requestOpen: (kind: string, resourceId: string | undefined, label: string, icon: LucideIcon) =>
      openInMain(kind, resourceId, label, icon),

    /**
     * Check if a resource is currently open anywhere
     */
    isOpen: (resourceId: string) => findViewLocations(resourceId).length > 0,

    /**
     * Update a view's properties
     * Typically called when a resource is saved and receives an ID, or when properties like label change
     */
    updateView: (viewId: string, updates: Partial<Omit<View, "id">>) => updateView(viewId, updates),
  }
}

/**
 * Example usage patterns:
 *
 * // In a Menu component
 * const openInMain = useWorkspace(state => state.openInMain)
 * const handleClick = () => openInMain('markdown', doc.id, doc.title, 'file')
 *
 * // In ViewBar component
 * const views = useWorkspace(workspaceSelectors.mainViews)
 * const closeView = useWorkspace(state => state.closeView)
 *
 * // In a View component
 * const { requestClose } = useWorkspaceCommands()
 * const handleDelete = async () => {
 *   await deleteDoc(docId)
 *   requestClose(docId)
 * }
 */
