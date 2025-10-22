import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { atom, type PrimitiveAtom, useAtom } from "jotai"
import { splitAtom } from "jotai/utils"

export type WorkspaceTab = {
  instanceId: string
  chatId?: Id<"chats_v0">
  title?: string
}

export type WorkspaceTabAtom = PrimitiveAtom<WorkspaceTab>

const workspaceTabsArrayAtom = atom<WorkspaceTab[]>([])
export const workspaceTabsAtom = splitAtom(workspaceTabsArrayAtom, (item) => item.instanceId)

export const tabsIndexMapAtom = atom((get) => {
  const workspaceTabsAtoms = get(workspaceTabsAtom)
  const map = new Map(
    workspaceTabsAtoms.map((a) => {
      const d = get(a)
      return [d.chatId ?? null, a]
    })
  )

  return map
})

export const activeTabAtomAtom = atom<WorkspaceTabAtom | undefined>()

export const readActiveTabAtom = atom((get) => {
  const aaa = get(activeTabAtomAtom)
  if (aaa) {
    return get(aaa)
  }
})

export function useWorkspace2() {
  return useAtom(workspaceTabsAtom)
}
