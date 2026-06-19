import { useCallback, useEffect, useRef, useState } from "react"

export type AsyncStatus = "idle" | "loading" | "failed"

interface UseDataLoadingResult<T> {
  readonly data: T | undefined
  readonly status: AsyncStatus
  readonly error: unknown
  readonly reload: () => void
}

/**
 * Single entry point for data reads. Components/logic hooks pass a loader
 * (typically an Orval-generated call) and never fetch inline.
 * Minimal seam for M0 — keyed refetching is refined alongside real endpoints in M1.
 */
export function useDataLoading<T>(loader: () => Promise<T>): UseDataLoadingResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  // Starts in "loading" because the mount effect kicks off a load immediately.
  const [status, setStatus] = useState<AsyncStatus>("loading")
  const [error, setError] = useState<unknown>(undefined)

  // Latest-ref so the callbacks stay stable without going stale (updated in an effect).
  const loaderRef = useRef(loader)
  useEffect(() => {
    loaderRef.current = loader
  }, [loader])

  // Only mutates state asynchronously (in the promise callbacks), so it is safe
  // to call from the mount effect.
  const load = useCallback(() => {
    void loaderRef
      .current()
      .then((result) => {
        setData(result)
        setStatus("idle")
      })
      .catch((err: unknown) => {
        setError(err)
        setStatus("failed")
      })
  }, [])

  // Manual refresh from event handlers; safe to set "loading" synchronously here.
  const reload = useCallback(() => {
    setStatus("loading")
    setError(undefined)
    load()
  }, [load])

  useEffect(() => {
    load()
  }, [load])

  return { data, status, error, reload }
}
