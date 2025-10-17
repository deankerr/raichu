"use client"

import { KeyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useOpenRouterPkce } from "@/hooks/use-openrouter-pkce"

export function OpenRouterMenu() {
  const { status, message, storedKey, keyPreview, connect, clearStoredKey } = useOpenRouterPkce()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={status === "redirect" || status === "exchanging"}
          size="icon-sm"
          variant="outline"
        >
          <KeyIcon />
          <span className="sr-only">OpenRouter actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>OpenRouter</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          {keyPreview ? `Key saved (${keyPreview})` : "No key stored"}
        </DropdownMenuItem>
        {message && (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground text-xs">{message}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={status === "redirect" || status === "exchanging"}
          onClick={connect}
        >
          {storedKey ? "Re-connect" : "Connect"}
        </DropdownMenuItem>
        {storedKey && (
          <DropdownMenuItem onClick={clearStoredKey}>Clear stored key</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
