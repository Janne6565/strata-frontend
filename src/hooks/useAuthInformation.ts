import { useCallback, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"

import { logout as logoutSession } from "@/api/generated/authentication/authentication"
import { clearAuthToken } from "@/lib/auth"
import { clearIdentity } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/**
 * Single read/imperative surface for identity. Components read `isLoggedIn`,
 * `user`, `role` from here rather than reaching into the auth slice, and call
 * `logout()` instead of clearing the token themselves. Logout hits the backend
 * to clear the httpOnly refresh cookie, then drops the in-memory access token
 * and local identity.
 */
export function useAuthInformation() {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = useCallback(() => {
    // Fire-and-forget: clearing local state must not wait on (or be blocked by)
    // the cookie-clearing request. A failed logout still logs the user out here;
    // the cookie then lapses on its own TTL.
    void logoutSession().catch(() => undefined)
    clearAuthToken()
    dispatch(clearIdentity())
    void navigate({ to: "/login" })
  }, [dispatch, navigate])

  const role = auth.user?.role ?? null

  return useMemo(
    () => ({
      isLoggedIn: Boolean(auth.token),
      isBootstrapped: auth.bootstrapped,
      user: auth.user,
      username: auth.user?.username ?? null,
      role,
      // OWNER and ADMIN share the admin-only surfaces (rescan, manual-add, admin nav).
      isAdmin: role === "ADMIN" || role === "OWNER",
      // OWNER-only surfaces (e.g. database backups).
      isOwner: role === "OWNER",
      logout,
    }),
    [auth, role, logout]
  )
}
