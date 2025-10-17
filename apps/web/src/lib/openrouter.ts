/**
 * Generates a PKCE code verifier for OpenRouter OAuth flow
 * @param length - Length of the code verifier (default: 64)
 * @returns Random code verifier string
 */
function generateCodeVerifier(length = 64): string {
  const CODE_VERIFIER_ALLOWED_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  const buffer = new Uint8Array(length)
  crypto.getRandomValues(buffer)

  let result = ""
  for (const value of buffer) {
    result += CODE_VERIFIER_ALLOWED_CHARS.charAt(value % CODE_VERIFIER_ALLOWED_CHARS.length)
  }
  return result
}

/**
 * Encodes an ArrayBuffer to base64url format for PKCE
 * @param buffer - ArrayBuffer to encode
 * @returns base64url encoded string
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

/**
 * Creates a PKCE code challenge from a code verifier
 * @param codeVerifier - The code verifier to hash
 * @returns SHA-256 hash encoded as base64url
 */
async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return base64UrlEncode(hash)
}

/**
 * Generates OpenRouter authorization URL with PKCE parameters
 * @param callbackUrl - URL to redirect back to after authorization
 * @returns Object containing the auth URL and code verifier
 */
export async function generateOpenRouterAuthUrl(
  callbackUrl: string
): Promise<{ url: string; codeVerifier: string }> {
  try {
    console.log("Generating OpenRouter PKCE auth URL")

    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await createCodeChallenge(codeVerifier)

    const authUrl = new URL("https://openrouter.ai/auth")
    authUrl.searchParams.set("callback_url", callbackUrl)
    authUrl.searchParams.set("code_challenge", codeChallenge)
    authUrl.searchParams.set("code_challenge_method", "S256")

    return {
      url: authUrl.toString(),
      codeVerifier,
    }
  } catch (error) {
    console.error("Failed to generate OpenRouter auth URL:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to generate auth URL")
  }
}

/**
 * Exchanges OpenRouter authorization code for API key
 * @param code - Authorization code from OpenRouter callback
 * @param codeVerifier - PKCE code verifier generated during auth start
 * @returns OpenRouter API key
 */
export async function exchangeCodeForApiKey(
  code: string | null,
  codeVerifier: string
): Promise<string> {
  try {
    console.log("Exchanging authorization code for API key")

    if (!code) {
      throw new Error("No authorization code provided")
    }

    if (!codeVerifier) {
      throw new Error("Missing code verifier. Please start again.")
    }

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
      const errorMessage = data?.error || "Failed to exchange code for key"
      throw new Error(errorMessage)
    }

    const key = data?.key
    if (!key) {
      throw new Error("No key returned from OpenRouter.")
    }

    console.log("Successfully obtained OpenRouter API key")
    return key
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    console.error("OpenRouter key exchange failed:", error)
    throw new Error(error instanceof Error ? error.message : "Unable to connect to OpenRouter")
  }
}
