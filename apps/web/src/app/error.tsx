"use client"

import { XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import posthog from "posthog-js"
import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  // const isDev = process.env.NODE_ENV === "development"
  const router = useRouter()

  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <Alert className="max-w-3xl" variant="destructive">
        <XCircle />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          An error occurred while rendering this page. These options may help:
          <div className="mt-2 space-x-2">
            <Button
              onClick={() => {
                window.location.reload()
              }}
              variant="secondary"
            >
              Refresh Page
            </Button>

            <Button onClick={() => router.push("/")} variant="secondary">
              Go Home
            </Button>
          </div>
          {error?.message && <div className="py-3 font-mono text-sm">{error.message}</div>}
          {error?.digest && <div className="py-3 font-mono text-xs">Digest: {error.digest}</div>}
        </AlertDescription>
      </Alert>
    </div>
  )
}
