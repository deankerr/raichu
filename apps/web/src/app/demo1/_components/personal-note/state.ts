import { api } from "@raichu/backend/convex/_generated/api"
import { useQuery } from "convex/react"

export function usePersonalNote(noteId: string) {
  return useQuery(api.v0.personalNotes.get, noteId ? { id: noteId } : "skip")
}
