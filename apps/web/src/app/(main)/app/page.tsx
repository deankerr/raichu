"use client"

import { CircleSlash2Icon } from "lucide-react"
import { ChatView } from "./_components/chat/chat"

import { ChatsMenu } from "./_components/sidebar/chats-menu"
import { TabBar, TabButton, TabIconButton } from "./_components/tabs"
import { UserPanel } from "./_components/user-panel"
import { useWorkspace, WorkspaceArea, workspaceSelectors } from "./_components/workspace/workspace"

export default function Page() {
  // Sidebar state
  const sidebarViews = useWorkspace(workspaceSelectors.sidebarViews)
  const activeSidebarView = useWorkspace(workspaceSelectors.activeSidebarView)
  const setActiveView = useWorkspace((state) => state.setActiveView)
  const closeView = useWorkspace((state) => state.closeView)

  // Main area state
  const mainViews = useWorkspace(workspaceSelectors.mainViews)
  const activeMainView = useWorkspace(workspaceSelectors.activeMainView)

  return (
    <>
      {/* sidebar */}
      <WorkspaceArea className="w-72 bg-black/30">
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

      {/* main */}
      <WorkspaceArea className="flex-1">
        <TabBar>
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
    </>
  )
}

/**
 * Renders the appropriate view component based on view.kind
 * In the future, this will use a views registry
 */
function ViewRenderer({
  view,
}: {
  view?: { id: string; kind: string; resourceId: string | undefined; label: string }
}) {
  if (!view) {
    return (
      <div className="grid flex-1 place-content-center text-muted-foreground opacity-50">
        <CircleSlash2Icon />
      </div>
    )
  }
  switch (view.kind) {
    case "chat":
      return <ChatView resourceId={view.resourceId} viewId={view.id} />
    case "chats-menu":
      return <ChatsMenu className="h-full" />
    default:
      return (
        <div className="grid h-full place-content-center text-muted-foreground">
          <p className="text-sm">Unknown view kind: {view.kind}</p>
        </div>
      )
  }
}
