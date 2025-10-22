import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

export const chatInputAtomFamily = atomFamily(
  ({ instanceId, modelId, input }: { instanceId: string; modelId?: string; input?: string }) =>
    atom({
      instanceId,
      modelId: atom(modelId),
      input: atom(input),
    }),
  (a, b) => a.instanceId === b.instanceId
)

export const chatParamsSidebarOpenAtom = atom(false)
