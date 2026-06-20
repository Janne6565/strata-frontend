import { useCallback, useState } from "react"

import type { AsyncStatus } from "@/api/useDataLoading"
import { extractProblemDetail } from "@/lib/errors"

interface UseDataInteractionsResult {
  readonly status: AsyncStatus
  readonly errorMessage: string | null
  readonly run: <T>(
    action: () => Promise<T>,
    fallbackMessage?: string
  ) => Promise<boolean>
  readonly clearError: () => void
}

/**
 * Single entry point for mutations (create/update/delete). Logic hooks call
 * `run(() => generatedCall(...))`; components never invoke API calls directly.
 *
 * `run` resolves to `true` on success and `false` on failure. On failure it
 * surfaces the backend's RFC 7807 ProblemDetail message verbatim, falling back
 * to the supplied translated message when the error isn't a recognizable API
 * error. This makes the seam a superset of the old per-hook `guard` helpers.
 */
export function useDataInteractions(): UseDataInteractionsResult {
  const [status, setStatus] = useState<AsyncStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const run = useCallback(
    async <T,>(
      action: () => Promise<T>,
      fallbackMessage?: string
    ): Promise<boolean> => {
      setStatus("loading")
      setErrorMessage(null)
      try {
        await action()
        setStatus("idle")
        return true
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? fallbackMessage ?? null)
        setStatus("failed")
        return false
      }
    },
    []
  )

  const clearError = useCallback(() => setErrorMessage(null), [])

  return { status, errorMessage, run, clearError }
}
