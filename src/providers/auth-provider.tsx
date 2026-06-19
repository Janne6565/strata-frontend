import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

import { me } from "@/api/generated/authentication/authentication"
import { clearAuthToken, getAuthToken } from "@/lib/auth"
import {
  clearIdentity,
  markBootstrapped,
  setAuthStatus,
  setIdentity,
} from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/**
 * Validates a persisted token on startup by calling `me()`, so a reload keeps
 * the user signed in (and a stale token is dropped) before any route guard
 * runs. Children render only once this has settled.
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const dispatch = useAppDispatch()
  const bootstrapped = useAppSelector((state) => state.auth.bootstrapped)
  // StrictMode double-invokes effects in dev; guard so bootstrap runs once.
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    const token = getAuthToken()
    if (!token) {
      dispatch(markBootstrapped())
      return
    }

    dispatch(setAuthStatus("loading"))
    void (async () => {
      try {
        const user = await me()
        dispatch(setIdentity({ token, user }))
      } catch {
        clearAuthToken()
        dispatch(clearIdentity())
      } finally {
        dispatch(markBootstrapped())
      }
    })()
  }, [dispatch])

  if (!bootstrapped) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
