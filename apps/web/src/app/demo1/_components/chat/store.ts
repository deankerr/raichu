import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

export const chatInputAtomFamily = atomFamily(
  ({ chatId, modelId, input }: { chatId: string; modelId?: string; input?: string }) =>
    atom({
      chatId,
      modelId: atom(modelId),
      input: atom(input),
    }),
  (a, b) => a.chatId === b.chatId
)

export const chatParamsSidebarOpenAtom = atom(false)
