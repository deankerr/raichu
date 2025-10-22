import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addEnvPrefix(title: string) {
  const emoji = process.env.NEXT_PUBLIC_TITLE_PREFIX ?? ""
  return `${emoji}${title}`.trim()
}

export function getErrorMessage(err: unknown) {
  if (err instanceof Error && typeof err.message === "string") {
    return err.message
  }
  if (typeof err === "string") {
    return err
  }
  return "Unknown error"
}
