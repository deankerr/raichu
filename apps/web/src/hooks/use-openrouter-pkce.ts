"use client"

import { useCallback, useEffect, useState } from "react"
import { exchangeCodeForApiKey, generateOpenRouterAuthUrl } from "../lib/openrouter"

type Status = "idle" | "redirect" | "exchanging"

const CODE_VERIFIER_STORAGE_KEY = "openrouter_pkce_code_verifier"

function cleansedUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete("code")
  url.searchParams.delete("error")
  url.searchParams.delete("state")
  return `${url.pathname}${url.search}${url.hash}`
}

export function useOpenRouterPkce() {
  const [status, setStatus] = useState<Status>("idle")
  const [key, setKey] = useState<string | null>(null)

  // Handle auth callback on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const error = params.get("error")

      if (!(code || error)) {
        return
      }

      if (error) {
        console.error(`OpenRouter error: ${error}`)
        window.history.replaceState(null, "", cleansedUrl())
        return
      }

      try {
        setStatus("exchanging")
        const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY)
        if (!codeVerifier) {
          throw new Error("Missing code verifier. Please start again.")
        }

        const apiKey = await exchangeCodeForApiKey(code, codeVerifier)
        setKey(apiKey)
        sessionStorage.removeItem(CODE_VERIFIER_STORAGE_KEY)
        setStatus("idle")
      } catch (err) {
        console.error("OpenRouter key exchange failed:", err)
        setStatus("idle")
      } finally {
        window.history.replaceState(null, "", cleansedUrl())
      }
    }

    handleAuthCallback()
  }, [])

  const startConnect = useCallback(async () => {
    if (typeof window === "undefined") {
      return
    }

    try {
      setStatus("redirect")
      setKey(null)

      const callbackUrl = `${window.location.origin}${window.location.pathname}`
      const { url, codeVerifier } = await generateOpenRouterAuthUrl(callbackUrl)

      sessionStorage.setItem(CODE_VERIFIER_STORAGE_KEY, codeVerifier)

      console.log("Redirecting to OpenRouter for authorization")
      window.location.assign(url)
    } catch (err) {
      console.error("OpenRouter PKCE redirect failed:", err)
      setStatus("idle")
    }
  }, [])

  const reset = useCallback(() => {
    setKey(null)
    setStatus("idle")
  }, [])

  return {
    status,
    key,
    connect: startConnect,
    reset,
  }
}

export type { Status as OpenRouterPkceStatus }
