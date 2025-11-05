"use client"

import { TabBar, TabIconButton } from "./tabs"
import { UserPanel } from "./user-panel"
import { ViewRenderer } from "./view-renderer"
import { useWorkspace, workspaceSelectors } from "./workspace/workspace"
import { WorkspaceArea } from "./workspace/workspace-area"

export function Sidebar() {
  const sidebarViews = useWorkspace(workspaceSelectors.sidebarViews)
  const activeSidebarView = useWorkspace(workspaceSelectors.activeSidebarView)
  const setActiveView = useWorkspace((state) => state.setActiveView)

  const isSidebarVisible = useWorkspace(workspaceSelectors.isSidebarVisible)

  return (
    <WorkspaceArea className="w-72 bg-black/30" isCollapsed={!isSidebarVisible}>
      <TabBar>
        {sidebarViews.map((view) => (
          <TabIconButton
            isActive={view.id === activeSidebarView?.id}
            key={view.id}
            label={view.label}
            onClick={() => setActiveView(view.id)}
          >
            <view.icon />
          </TabIconButton>
        ))}
      </TabBar>

      <ViewRenderer view={activeSidebarView} />
      <UserPanel />
    </WorkspaceArea>
  )
}
