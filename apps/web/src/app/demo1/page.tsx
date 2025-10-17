"use client"

import { api } from "@raichu/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { useAtom } from "jotai"
import { CircleSlash2Icon, PanelLeftCloseIcon, PanelLeftOpenIcon, PlusIcon } from "lucide-react"
import { Chat } from "./_components/chat/chat"
import {
  Shell,
  ShellDock,
  ShellDockContent,
  ShellDockLeft,
  ShellDockTabBar,
  ShellDockTabButton,
  ShellDockTabIconButton,
} from "./_components/shell"
import { leftSidebarOpenAtom } from "./_components/store"
import { ThreadExplorer } from "./_components/thread-explorer/thread-explorer"
import { Viewport } from "./_components/viewport"
import { useWorkspace, WorkspaceProvider } from "./_components/workspace"

function PageContent() {
  const workspace = useWorkspace()

  const mainActiveTab = workspace.getActiveTab("main")

  const [isLeftSidebarOpen, setLeftSidebarOpen] = useAtom(leftSidebarOpenAtom)

  const userData = useQuery(api.healthCheck.getUser)

  return (
    <Shell>
      <ShellDockLeft className="bg-black/30" isOpen={isLeftSidebarOpen}>
        <ShellDockTabBar>
          {workspace.state.tabs.left.map((panel) => (
            <ShellDockTabIconButton
              isActive={workspace.getActiveTab("left")?.instanceId === panel.instanceId}
              key={panel.instanceId}
              label={panel.componentName}
            >
              {<panel.icon className="size-3.5" />}
            </ShellDockTabIconButton>
          ))}
        </ShellDockTabBar>

        <ShellDockContent>
          <ThreadExplorer />
        </ShellDockContent>
      </ShellDockLeft>

      <ShellDock>
        <ShellDockTabBar>
          {/* * left sidebar toggle */}
          <ShellDockTabIconButton
            isActive={isLeftSidebarOpen}
            label={isLeftSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
          >
            {isLeftSidebarOpen ? (
              <PanelLeftCloseIcon className="size-3.5" />
            ) : (
              <PanelLeftOpenIcon className="size-3.5" />
            )}
          </ShellDockTabIconButton>

          {workspace.state.tabs.main.map((tab) => (
            <ShellDockTabButton
              isActive={workspace.getActiveTab("main")?.instanceId === tab.instanceId}
              key={tab.instanceId}
              label={tab.title ?? tab.componentName}
              onClick={() =>
                workspace.dispatch({
                  type: "FOCUS_TAB",
                  instanceId: tab.instanceId,
                })
              }
              onClose={() =>
                workspace.dispatch({
                  type: "REMOVE_TAB",
                  instanceId: tab.instanceId,
                })
              }
            />
          ))}

          <ShellDockTabIconButton
            isActive={false}
            label="New Chat"
            onClick={() =>
              workspace.dispatch({
                type: "ADD_TAB",
                componentId: "chat",
                area: "main",
                tab: {},
              })
            }
          >
            <PlusIcon className="size-3.5" />
          </ShellDockTabIconButton>
        </ShellDockTabBar>

        {/*
         * Render active tab content
         * For now all tabs are chats, but this is where we'd branch
         * to different content types in the future
         */}
        {mainActiveTab ? (
          <ShellDockContent>
            <Chat
              instanceId={mainActiveTab.instanceId}
              key={mainActiveTab.instanceId}
              threadId={(mainActiveTab.props?.threadId as string) ?? "new"}
            />
          </ShellDockContent>
        ) : (
          <ShellDockContent>
            <div className="flex flex-1 flex-col gap-8 overflow-y-auto text-muted-foreground opacity-50">
              <CircleSlash2Icon />

              <pre className="whitespace-pre-wrap font-mono text-xs">
                USERDATA: {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          </ShellDockContent>
        )}
      </ShellDock>
    </Shell>
  )
}

export default function Page() {
  return (
    <WorkspaceProvider>
      <Viewport className="pt-12">
        <PageContent />
      </Viewport>
    </WorkspaceProvider>
  )
}
