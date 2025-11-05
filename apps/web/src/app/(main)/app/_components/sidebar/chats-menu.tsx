import { api } from "@raichu/backend/convex/_generated/api"
import type { Id } from "@raichu/backend/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import {
  EditIcon,
  MessagesSquareIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useWorkspace, workspaceSelectors } from "../workspace/workspace"

export function ChatsMenu({ children, className, ...props }: React.ComponentProps<"div">) {
  const chats = useQuery(api.v0.chats.list)
  const openInMain = useWorkspace((state) => state.openInMain)
  const activeMainView = useWorkspace(workspaceSelectors.activeMainView)

  const handleNewChat = () => {
    openInMain("chat", undefined, "New Chat", MessagesSquareIcon)
  }

  return (
    <div className={cn("flex flex-col gap-2 p-2", className)} {...props}>
      <div className="flex items-center justify-between px-2 py-1">
        <div className="font-medium text-sidebar-foreground/70 text-xs">Chats</div>
        <Button onClick={handleNewChat} size="icon-sm" variant="ghost">
          <PlusIcon />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {!chats && (
          <div className="grid flex-1 place-content-center px-2 text-muted-foreground">
            <Spinner />
          </div>
        )}

        {chats && chats.length === 0 && (
          <div className="grid flex-1 place-content-center px-2 text-muted-foreground opacity-50">
            <MessagesSquareIcon />
          </div>
        )}

        {chats?.map((chat) => {
          const label = chat?.label || "Untitled Chat"
          const isActive =
            activeMainView?.kind === "chat" && activeMainView?.resourceId === chat._id

          return (
            <ChatMenuButton
              chatId={chat._id}
              isActive={isActive}
              key={chat._id}
              label={label}
              onClick={() => openInMain("chat", chat._id, label, MessagesSquareIcon)}
            >
              {label}
            </ChatMenuButton>
          )
        })}
      </div>
    </div>
  )
}

export function ChatMenuButton({
  isActive,
  chatId,
  label,
  children,
  className,
  onClick,
  ...props
}: {
  isActive?: boolean
  chatId: Id<"chats">
  label: string
} & React.ComponentProps<"button">) {
  const deleteChat = useMutation(api.v0.chats.del)
  const closeResource = useWorkspace((state) => state.closeResource)

  const handleDelete = () => {
    deleteChat({ id: chatId })
    // Close any open views for this chat
    closeResource(chatId)
  }

  const handleShare = () => {
    window.open(`/share/${chatId}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="group/menu-item relative">
      <button
        className={cn(
          "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
          className
        )}
        data-active={isActive}
        data-sidebar="menu-button"
        data-slot="sidebar-menu-button"
        onClick={onClick}
        {...props}
      >
        <span className="truncate">{children}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Chat options"
            className={cn(
              "after:-inset-2 -translate-y-1/2 absolute top-1/2 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform after:absolute hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
              "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100",
              isActive && "opacity-100"
            )}
            data-sidebar="menu-action"
            data-slot="sidebar-menu-action"
            type="button"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" sideOffset={4}>
          <EditTitleDialog chatId={chatId} currentTitle={label}>
            <DropdownMenuDialogTrigger>
              <EditIcon className="size-3.5" />
              Edit Title
            </DropdownMenuDialogTrigger>
          </EditTitleDialog>
          <DropdownMenuItem onClick={handleShare}>
            <ShareIcon className="size-3.5" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <TrashIcon className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// mimics DropdownMenuItem without closing the menu on click
function DropdownMenuDialogTrigger({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:opacity-50 data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      data-inset={inset}
      data-radix-collection-item
      data-slot="dropdown-menu-dialog-trigger"
      data-variant={variant}
      role="menuitem"
      tabIndex={-1}
      {...props}
    />
  )
}

export function EditTitleDialog({
  currentTitle,
  children,
  chatId,
}: {
  currentTitle: string
  children: React.ReactNode
  chatId: Id<"chats">
}) {
  const [open, setOpen] = useState(false)
  const updateTitle = useMutation(api.v0.chats.update)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    const newTitle = inputRef.current?.value ?? ""
    if (newTitle !== currentTitle) {
      await updateTitle({ id: chatId, fields: { label: newTitle } })
    }
    setOpen(false)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Title</DialogTitle>
          <DialogDescription>Change the title of this chat.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="title">Title</Label>
            <Input defaultValue={currentTitle} id="title" ref={inputRef} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
