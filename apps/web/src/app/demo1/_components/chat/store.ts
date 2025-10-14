import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

// ? atomic atoms version
// export const chatInputAtomFamily = atomFamily(
//   ({ value }: { threadId: string; value?: string }) => atom(value ?? ""),
//   (a, b) => a.threadId === b.threadId
// )

export const chatInputAtomFamily = atomFamily(
  ({ threadId, modelId, input }: { threadId: string; modelId?: string; input?: string }) =>
    atom({
      threadId,
      modelId: atom(modelId),
      input: atom(input),
    }),
  (a, b) => a.threadId === b.threadId
)
