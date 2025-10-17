"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type Status = "idle" | "redirect" | "exchanging" | "success" | "error"

// Persist the transient verifier and fetched key between navigations.
const CODE_VERIFIER_STORAGE_KEY = "openrouter_pkce_code_verifier"
const API_KEY_STORAGE_KEY = "openrouter_api_key"

// RFC 7636-compliant verifier character set and helpers for base64-url encoding.
const CODE_VERIFIER_ALLOWED_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
const BASE64_PLUS_REGEX = /\+/g
const BASE64_SLASH_REGEX = /\//g
const BASE64_PADDING_REGEX = /=+$/
const SHORT_KEY_LENGTH = 12
const SHORT_KEY_PREFIX = 6
const SHORT_KEY_SUFFIX = 4

function generateCodeVerifier(length = 64) {
  const buffer = new Uint8Array(length)
  crypto.getRandomValues(buffer)

  let result = ""
  for (const value of buffer) {
    result += CODE_VERIFIER_ALLOWED_CHARS.charAt(value % CODE_VERIFIER_ALLOWED_CHARS.length)
  }
  return result
}

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
    .replace(BASE64_PLUS_REGEX, "-")
    .replace(BASE64_SLASH_REGEX, "_")
    .replace(BASE64_PADDING_REGEX, "")
}

async function buildCodeChallenge(codeVerifier: string) {
  const encoded = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest("SHA-256", encoded)
  return base64UrlEncode(digest)
}

function cleansedUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete("code")
  url.searchParams.delete("error")
  url.searchParams.delete("state")
  return `${url.pathname}${url.search}${url.hash}`
}

export function useOpenRouterPkce() {
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [storedKey, setStoredKey] = useState<string | null>(null)

  // Inspect the URL once on mount for a returned authorization code.
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const existingKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (existingKey) {
      setStoredKey(existingKey)
    }

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const error = params.get("error")

    if (!(code || error)) {
      return
    }

    if (error) {
      setStatus("error")
      setMessage(`OpenRouter error: ${error}`)
      window.history.replaceState(null, "", cleansedUrl())
      return
    }

    const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_STORAGE_KEY)
    if (!codeVerifier) {
      setStatus("error")
      setMessage("Missing code verifier. Please start again.")
      window.history.replaceState(null, "", cleansedUrl())
      return
    }

    ;(async () => {
      try {
        setStatus("exchanging")
        setMessage(null)

        const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            code_challenge_method: "S256",
          }),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          const errorMessage = data?.error || "Failed to exchange code for key."
          throw new Error(errorMessage)
        }

        const key = data?.key
        if (!key) {
          throw new Error("No key returned from OpenRouter.")
        }

        localStorage.setItem(API_KEY_STORAGE_KEY, key)
        setStoredKey(key)
        sessionStorage.removeItem(CODE_VERIFIER_STORAGE_KEY)

        setStatus("success")
        setMessage("OpenRouter key stored in localStorage.")
      } catch (err) {
        console.error("OpenRouter key exchange failed", err)
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Unable to connect to OpenRouter.")
      } finally {
        window.history.replaceState(null, "", cleansedUrl())
      }
    })().catch((err) => {
      console.error("OpenRouter key exchange promise rejected", err)
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Unable to connect to OpenRouter.")
    })
  }, [])

  const keyPreview = useMemo(() => {
    if (!storedKey) {
      return null
    }
    if (storedKey.length <= SHORT_KEY_LENGTH) {
      return storedKey
    }
    return `${storedKey.slice(0, SHORT_KEY_PREFIX)}…${storedKey.slice(-SHORT_KEY_SUFFIX)}`
  }, [storedKey])

  const startConnect = useCallback(async () => {
    if (typeof window === "undefined") {
      return
    }

    try {
      setStatus("redirect")
      setMessage(null)

      // Generate PKCE materials, stash the verifier, and bounce the browser to OpenRouter.
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await buildCodeChallenge(codeVerifier)

      sessionStorage.setItem(CODE_VERIFIER_STORAGE_KEY, codeVerifier)

      const callbackUrl = `${window.location.origin}${window.location.pathname}`
      const url = new URL("https://openrouter.ai/auth")
      url.searchParams.set("callback_url", callbackUrl)
      url.searchParams.set("code_challenge", codeChallenge)
      url.searchParams.set("code_challenge_method", "S256")

      window.location.assign(url.toString())
    } catch (err) {
      console.error("OpenRouter PKCE redirect failed", err)
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Failed to start OpenRouter auth.")
    }
  }, [])

  const clearStoredKey = useCallback(() => {
    // Allow developers to reset the stored key during prototyping.
    localStorage.removeItem(API_KEY_STORAGE_KEY)
    setStoredKey(null)
    setMessage("Stored key cleared.")
    setStatus("idle")
  }, [])

  return {
    status,
    message,
    storedKey,
    keyPreview,
    connect: startConnect,
    clearStoredKey,
  }
}

export type { Status as OpenRouterPkceStatus }
