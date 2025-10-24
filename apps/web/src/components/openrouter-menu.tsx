"use client"

import { api } from "@raichu/backend/convex/_generated/api"
import { useUser } from "@stackframe/stack"
import { useAction } from "convex/react"
import { KeyIcon } from "lucide-react"
import { useEffect } from "react"
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
  const user = useUser()
  const storeKey = useAction(api.v0.users.storeOpenRouterApiKey)
  const { status, key, connect, reset } = useOpenRouterPkce()

  const isProcessing = status === "redirect" || status === "exchanging"
  const isReady = user && !isProcessing

  const keySignature = user?.clientReadOnlyMetadata?.openrouterApiKeySignature

  // Store key when it becomes available
  useEffect(() => {
    if (key && user) {
      const handleKeyReceived = async () => {
        try {
          await storeKey({ key })
          console.log("OpenRouter key stored successfully")
          reset()
        } catch (error) {
          console.error("Failed to store OpenRouter key:", error)
        }
      }

      handleKeyReceived()
    }
  }, [key, user, storeKey, reset])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={!isReady} size="icon-sm" variant="outline">
          <KeyIcon />
          <span className="sr-only">OpenRouter actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>OpenRouter</DropdownMenuLabel>
        <DropdownMenuItem disabled>{keySignature ?? "No key stored"}</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!isReady} onClick={connect}>
          Connect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
