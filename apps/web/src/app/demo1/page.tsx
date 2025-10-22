"use client"

import { UserButton } from "@stackframe/stack"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
  CircleSlash2Icon,
  MessagesSquareIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
} from "lucide-react"
import { OpenRouterMenu } from "@/components/openrouter-menu"
import { Chat } from "./_components/chat/chat"
import { NewChat } from "./_components/chat/new-chat"
import { ThreadExplorer } from "./_components/thread-explorer/thread-explorer"
import { useWorkspace, WorkspaceProvider } from "./_components/workspace"
import {
  activeTabAtomAtom,
  readActiveTabAtom,
  type WorkspaceTabAtom,
  workspaceTabsAtom,
} from "./_components/workspace2/provider"
import { leftSidebarOpenAtom } from "./_components/workspace2/store"
import { TabButton, TabIconButton } from "./_components/workspace2/tabs"
import { Workspace2 } from "./_components/workspace2/workspace2"

function UserPanel() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-1.5 border-t p-1.5">
      <div className="grid size-8 place-content-center overflow-hidden rounded-full border-2">
        <UserButton />
      </div>
      <OpenRouterMenu />
    </div>
  )
}

function LeftSidebar() {
  const [isLeftSidebarOpen] = useAtom(leftSidebarOpenAtom)
  return (
    <Workspace2.CollapsiblePanel isCollapsed={!isLeftSidebarOpen}>
      <Workspace2.Stack className="bg-black/30">
        <Workspace2.Row className="h-11 border-b">
          <TabIconButton isActive={true} label={"Chats Explorer"}>
            <MessagesSquareIcon />
          </TabIconButton>
        </Workspace2.Row>

        <ThreadExplorer className="flex-1" />

        <UserPanel />
      </Workspace2.Stack>
    </Workspace2.CollapsiblePanel>
  )
}

function LeftSidebarToggle() {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useAtom(leftSidebarOpenAtom)
  return (
    <TabIconButton
      isActive={false}
      label={isLeftSidebarOpen ? "Hide sidebar" : "Show sidebar"}
      onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
    >
      {isLeftSidebarOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
    </TabIconButton>
  )
}

function Tab({ tabAtom }: { tabAtom: WorkspaceTabAtom }) {
  const dispatch = useSetAtom(workspaceTabsAtom)
  const tab = useAtomValue(tabAtom)

  return (
    <TabButton
      isActive={false}
      label={tab.title ?? "UNTITLED"}
      // onClick={() =>
      //   workspace.dispatch({
      //     type: "FOCUS_TAB",
      //     instanceId: tab.instanceId,
      //   })
      // }
      onClose={() =>
        dispatch({
          type: "remove",
          atom: tabAtom,
        })
      }
    />
  )
}

function Main() {
  const workspace = useWorkspace()
  const workspaceTabs = useAtomValue(workspaceTabsAtom)

  const activeTabAtom = useAtomValue(activeTabAtomAtom)
  const activeWorkspaceTab = useAtomValue(readActiveTabAtom)

  return (
    <Workspace2.Panel>
      <Workspace2.Stack>
        <Workspace2.Row className="h-11 border-b">
          <LeftSidebarToggle />

          {workspaceTabs.map((tabAtom) => (
            <Tab key={tabAtom.toString()} tabAtom={tabAtom} />
          ))}

          <div className="flex-1" />

          <TabIconButton
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
            <PlusIcon />
          </TabIconButton>
        </Workspace2.Row>

        {/*
         * Render active tab content
         * For now all tabs are chats, but this is where we'd branch
         * to different content types in the future
         */}
        {activeWorkspaceTab?.chatId && (
          <Chat
            chatId={activeWorkspaceTab.chatId}
            instanceId={activeWorkspaceTab.instanceId}
            key={activeWorkspaceTab.instanceId}
          />
        )}

        {activeWorkspaceTab && !activeWorkspaceTab.chatId && (
          <NewChat instanceId={activeWorkspaceTab.instanceId} />
        )}

        {!activeWorkspaceTab && (
          <div className="grid flex-1 place-content-center text-muted-foreground opacity-50">
            <CircleSlash2Icon />
          </div>
        )}
      </Workspace2.Stack>
    </Workspace2.Panel>
  )
}

export default function Page() {
  return (
    <WorkspaceProvider>
      <div className="grid h-svh overflow-hidden bg-black/50 p-1.5">
        <Workspace2.Frame>
          <Workspace2.Group>
            <LeftSidebar />
            <Main />
          </Workspace2.Group>
        </Workspace2.Frame>
      </div>
    </WorkspaceProvider>
  )
}
