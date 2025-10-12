import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const showViewportDecorationAtom = atom(false)
export const leftSidebarOpenAtom = atomWithStorage("left-sidebar-open", true)
