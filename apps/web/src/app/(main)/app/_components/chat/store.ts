import type { ChatDoc } from "@raichu/backend/convex/v0/chats"
import { atom, useAtom } from "jotai"
import { atomFamily } from "jotai/utils"

function createChatAtom({ resourceKey, chat }: { resourceKey?: string; chat?: ChatDoc }) {
  return atom({
    resourceKey,
    input: atom(""),

    chatId: chat?._id,
    threadId: chat?.threadId,
    label: chat?.label,
    languageModelSettingsAtom: atom<ChatDoc["languageModelSettings"]>(chat?.languageModelSettings),
    agentSettingsAtom: atom<ChatDoc["agentSettings"]>(chat?.agentSettings),
  })
}

export const resourceStateFamily = atomFamily(
  (args: { resourceKey: string; chat?: ChatDoc }) => createChatAtom(args),
  (a, b) => a.resourceKey === b.resourceKey
)

export function useChatResourceAtom(args: { resourceKey: string; chat?: ChatDoc }) {
  return useAtom(resourceStateFamily(args))
}

export type ChatAtom = ReturnType<typeof useChatResourceAtom>
export type ChatAtomValue = ChatAtom[0]
