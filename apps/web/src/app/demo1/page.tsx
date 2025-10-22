"use client"

import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { UserButton } from "@stackframe/stack"
import { useAtom } from "jotai"
import {
  CircleSlash2Icon,
  MessagesSquareIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
} from "lucide-react"
import { OpenRouterMenu } from "@/components/openrouter-menu"
import { Toggle } from "@/components/ui/toggle"
import { Chat } from "./_components/chat/chat"
import { NewChat } from "./_components/chat/new-chat"
import { ChatsMenu } from "./_components/chats-menu/chats-menu"
import { useWorkspaceContext, WorkspaceProvider } from "./_components/provider"
import { leftSidebarOpenAtom } from "./_components/store"
import { TabButton, TabIconButton } from "./_components/tabs"
import { Workspace } from "./_components/workspace"

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
    <Workspace.CollapsiblePanel isCollapsed={!isLeftSidebarOpen}>
      <Workspace.Stack className="bg-black/30">
        <Workspace.Row className="h-11 border-b">
          <TabIconButton isActive={true} label={"Chats Explorer"}>
            <MessagesSquareIcon />
          </TabIconButton>
        </Workspace.Row>

        <ChatsMenu className="flex-1" />

        <UserPanel />
      </Workspace.Stack>
    </Workspace.CollapsiblePanel>
  )
}

function LeftSidebarToggle() {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useAtom(leftSidebarOpenAtom)

  return (
    <Toggle
      aria-label="Toggle sidebar"
      className="group data-[state=on]:bg-transparent"
      onPressedChange={setLeftSidebarOpen}
      pressed={isLeftSidebarOpen}
    >
      <PanelLeftCloseIcon className="group-data-[state=off]:hidden" />
      <PanelLeftOpenIcon className="group-data-[state=on]:hidden" />
    </Toggle>
  )
}

function Tab({ tabId }: { tabId: string }) {
  const { tabs, activeTabId, controls } = useWorkspaceContext()
  const tab = tabs.find((t) => t.tabId === tabId)

  if (!tab) return null

  return (
    <TabButton
      isActive={activeTabId === tabId}
      label={tab.title}
      onClick={() => controls.setActiveTab(tabId)}
      onClose={() => controls.removeTab(tabId)}
    />
  )
}

function Main() {
  const { tabs, activeTab, controls } = useWorkspaceContext()

  return (
    <Workspace.Panel>
      <Workspace.Stack>
        <Workspace.Row className="h-11 border-b">
          <LeftSidebarToggle />

          {tabs.map((tab) => (
            <Tab key={tab.tabId} tabId={tab.tabId} />
          ))}

          <div className="flex-1" />

          <TabIconButton
            isActive={false}
            label="New Chat"
            onClick={() => {
              controls.addTab({
                componentType: "new-chat",
                componentId: "",
                title: "New Chat",
              })
            }}
          >
            <PlusIcon />
          </TabIconButton>
        </Workspace.Row>

        {/*
         * Render active tab content
         * Branch based on componentType
         */}
        {activeTab?.componentType === "chat" && (
          <Chat
            chatId={activeTab.componentId as Id<"chats_v0">}
            key={activeTab.tabId}
            stateKey={activeTab.componentId}
            tabId={activeTab.tabId}
          />
        )}

        {activeTab?.componentType === "new-chat" && (
          <NewChat key={activeTab.tabId} stateKey={activeTab.tabId} tabId={activeTab.tabId} />
        )}

        {!activeTab && (
          <div className="grid flex-1 place-content-center text-muted-foreground opacity-50">
            <CircleSlash2Icon />
          </div>
        )}
      </Workspace.Stack>
    </Workspace.Panel>
  )
}

export default function Page() {
  return (
    <WorkspaceProvider>
      <div className="grid h-svh overflow-hidden bg-black/50 p-1.5">
        <Workspace.Frame>
          <Workspace.Group>
            <LeftSidebar />
            <Main />
          </Workspace.Group>
        </Workspace.Frame>
      </div>
    </WorkspaceProvider>
  )
}
