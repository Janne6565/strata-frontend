import { useCallback, useState } from "react"

import type { AsyncStatus } from "@/api/useDataLoading"

interface UseDataInteractionsResult {
  readonly status: AsyncStatus
  readonly error: unknown
  readonly run: <T>(action: () => Promise<T>) => Promise<T | undefined>
}

/**
 * Single entry point for mutations (create/update/delete). Logic hooks call
 * `run(() => generatedCall(...))`; components never invoke API calls directly.
 */
export function useDataInteractions(): UseDataInteractionsResult {
  const [status, setStatus] = useState<AsyncStatus>("idle")
  const [error, setError] = useState<unknown>(undefined)

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setStatus("loading")
    setError(undefined)
    try {
      const result = await action()
      setStatus("idle")
      return result
    } catch (err) {
      setError(err)
      setStatus("failed")
      return undefined
    }
  }, [])

  return { status, error, run }
}
