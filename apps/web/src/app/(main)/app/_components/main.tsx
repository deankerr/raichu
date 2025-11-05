"use client"

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { TabBar, TabButton } from "./tabs"
import { ViewRenderer } from "./view-renderer"
import { useWorkspace, workspaceSelectors } from "./workspace/workspace"
import { WorkspaceArea } from "./workspace/workspace-area"

export function Main() {
  const mainViews = useWorkspace(workspaceSelectors.mainViews)
  const activeMainView = useWorkspace(workspaceSelectors.activeMainView)
  const setActiveView = useWorkspace((state) => state.setActiveView)
  const closeView = useWorkspace((state) => state.closeView)

  return (
    <WorkspaceArea className="flex-1">
      <TabBar>
        <SidebarToggle />
        {mainViews.map((view) => (
          <TabButton
            isActive={view.id === activeMainView?.id}
            key={view.id}
            label={view.label}
            onClick={() => setActiveView(view.id)}
            onClose={() => closeView(view.id)}
          />
        ))}
      </TabBar>

      <ViewRenderer view={activeMainView} />
    </WorkspaceArea>
  )
}

function SidebarToggle() {
  const isSidebarVisible = useWorkspace(workspaceSelectors.isSidebarVisible)
  const toggleSidebar = useWorkspace((state) => state.toggleSidebar)
  return (
    <Toggle
      aria-label="Toggle sidebar"
      className="group data-[state=on]:bg-transparent data-[state=on]:text-muted-foreground"
      onPressedChange={toggleSidebar}
      pressed={isSidebarVisible}
    >
      <PanelLeftCloseIcon className="group-data-[state=off]:hidden" />
      <PanelLeftOpenIcon className="group-data-[state=on]:hidden" />
    </Toggle>
  )
}
