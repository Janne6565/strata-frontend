import { useCallback, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"

import { clearAuthToken } from "@/lib/auth"
import { clearIdentity } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/**
 * Single read/imperative surface for identity. Components read `isLoggedIn`,
 * `user`, `role` from here rather than reaching into the auth slice, and call
 * `logout()` instead of clearing the token themselves. Logout is purely
 * client-side: the backend issues stateless JWTs with no server session to end.
 */
export function useAuthInformation() {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = useCallback(() => {
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
