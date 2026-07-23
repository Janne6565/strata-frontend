import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { token as refreshSession } from "@/api/generated/authentication/authentication"
import { clearAuthToken, setAuthToken } from "@/lib/auth"
import {
  clearIdentity,
  markBootstrapped,
  setAuthStatus,
  setIdentity,
} from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/**
 * Bootstraps the session on startup by exchanging the httpOnly refresh cookie
 * for a fresh in-memory access token (POST /api/v1/auth/token). On success the
 * user stays signed in across reloads without any token in storage; on 401 the
 * session is simply treated as signed-out. Children render only once this has
 * settled, so route guards see the final auth state.
 */
interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const bootstrapped = useAppSelector((state) => state.auth.bootstrapped)
  // StrictMode double-invokes effects in dev; guard so bootstrap runs once.
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    dispatch(setAuthStatus("loading"))
    void (async () => {
      try {
        const response = await refreshSession()
        if (!response.token) {
          throw new Error("Refresh response contained no access token")
        }
        setAuthToken(response.token)
        dispatch(
          setIdentity({ token: response.token, user: response.user ?? null })
        )
      } catch {
        // No valid refresh cookie (401) or malformed response → signed out.
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
        {t("common.loading")}
      </div>
    )
  }

  return <>{children}</>
}
