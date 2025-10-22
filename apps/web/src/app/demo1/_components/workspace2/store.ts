import { atomWithStorage } from "jotai/utils"

export const leftSidebarOpenAtom = atomWithStorage("left-sidebar-open", true)

export type WorkspaceTab = {
  instanceId: string
  chatId: string
}
