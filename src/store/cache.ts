// Shared shape + helpers for the cached server-data slices (datasources, groups,
// users, grants). Each list is fetched once and reused across screens; a fetch
// is skipped while one is in flight or while the cache is still fresh.

export const STALE_MS = 30_000

export type LoadStatus = "loading" | "idle" | "failed"

export interface ListState<T> {
  items: T[]
  loading: boolean
  loaded: boolean
  loadedAt: number | null
  error: string | null
}

export function initialListState<T>(): ListState<T> {
  return { items: [], loading: false, loaded: false, loadedAt: null, error: null }
}

/** True when a fetch should be SKIPPED (in flight, or loaded and still fresh). */
export function isFresh(
  state: { loading: boolean; loaded: boolean; loadedAt: number | null },
  force?: boolean
): boolean {
  if (force) {
    return false
  }
  if (state.loading) {
    return true
  }
  return (
    state.loaded &&
    state.loadedAt !== null &&
    Date.now() - state.loadedAt < STALE_MS
  )
}

/**
 * Page-facing status. Once loaded we always report "idle" (show the cached data),
 * so revisiting a screen or a background refresh never flashes a spinner; only the
 * very first load shows "loading"/"failed".
 */
export function deriveStatus(state: {
  loaded: boolean
  loading: boolean
  error: string | null
}): LoadStatus {
  if (state.loaded) {
    return "idle"
  }
  if (state.error) {
    return "failed"
  }
  return "loading"
}
