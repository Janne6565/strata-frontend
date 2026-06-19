import { redirect } from "@tanstack/react-router"

import { store } from "@/store/store"

export const AUTH_TOKEN_KEY = "strata.token"

export function getAuthToken(): string | null {
  return globalThis.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  globalThis.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  globalThis.localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

/**
 * Route guard for protected routes. Use from a route's `beforeLoad`.
 * Redirects to /login when no auth token is present. The full token lifecycle
 * (login, refresh, 401 handling) lands with the auth slice in M1.
 */
export function requireFullAuth(): void {
  if (!isAuthenticated()) {
    throw redirect({ to: "/login" })
  }
}

/**
 * Route guard for admin-only routes. Runs after the auth bootstrap, so the
 * user's role is in the store; non-admins are bounced to the databases screen.
 * The backend independently enforces authorization — this is just UX.
 */
export function requireAdmin(): void {
  requireFullAuth()
  const role = store.getState().auth.user?.role
  if (role !== "ADMIN" && role !== "OWNER") {
    throw redirect({ to: "/databases" })
  }
}
