import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

export const chatInputAtomFamily = atomFamily(
  ({ id, modelId, input }: { id: string; modelId?: string; input?: string }) =>
    atom({
      id,
      modelId: atom(modelId),
      input: atom(input),
    }),
  (a, b) => a.id === b.id
)

export const chatParamsSidebarOpenAtom = atom(false)
