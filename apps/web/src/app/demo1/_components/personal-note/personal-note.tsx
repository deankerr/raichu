import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { SaveIcon, TrashIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspaceContext } from "../provider"
import { Workspace } from "../workspace"
import { usePersonalNote } from "./state"

// NOTE: This is AI slop.

export function PersonalNote({ tabId, noteId }: { tabId: string; noteId?: Id<"personalNotes"> }) {
  const { controls } = useWorkspaceContext()
  const note = usePersonalNote(noteId ?? "")
  const createNote = useMutation(api.v0.personalNotes.create)
  const updateNote = useMutation(api.v0.personalNotes.update)
  const deleteNote = useMutation(api.v0.personalNotes.del)
  const [localContent, setLocalContent] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isCreating, setIsCreating] = useState(!noteId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Sync content when note loads
  useEffect(() => {
    if (note?.content !== undefined) {
      setLocalContent(note.content)
      setHasUnsavedChanges(false)
      setIsCreating(false)
    }
  }, [note?.content])

  const handleSave = async () => {
    try {
      if (isCreating || !noteId) {
        // Create new note
        const result = await createNote({
          title: "New Note",
          content: localContent,
        })

        // Update tab with new note ID
        controls.updateTab(tabId, {
          componentType: "personal-note",
          componentId: result.noteId,
          title: "New Note",
        })

        setIsCreating(false)
        setHasUnsavedChanges(false)
        toast.success("Note created")
      } else {
        // Update existing note
        await updateNote({
          id: noteId,
          content: localContent,
        })

        setHasUnsavedChanges(false)
        toast.success("Note saved")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to save note")
    }
  }

  const handleDelete = () => {
    if (!noteId || isCreating) {
      // Just close tab for new unsaved notes
      controls.removeTab(tabId)
      return
    }

    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!noteId) return

    try {
      await deleteNote({ id: noteId })
      controls.removeTab(tabId)
      toast.success("Note deleted")
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete note")
    }
  }

  const handleContentChange = (value: string) => {
    setLocalContent(value)
    setHasUnsavedChanges(true)
  }

  return (
    <Workspace.Group>
      <Workspace.Stack>
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="font-medium">{note?.label || "New Note"}</div>
          <div className="flex gap-2">
            <Button disabled={!hasUnsavedChanges} onClick={handleSave} size="sm" variant="outline">
              <SaveIcon />
              {isCreating ? "Create" : "Save"}
            </Button>
            <Button
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              size="sm"
              variant="outline"
            >
              <TrashIcon />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <Textarea
            className=""
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your note..."
            value={localContent}
          />
        </div>
      </Workspace.Stack>

      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Workspace.Group>
  )
}
