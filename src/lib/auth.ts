import { redirect } from "@tanstack/react-router"

import { store } from "@/store/store"

// Legacy key from the old localStorage-token model. The access token now lives
// in memory only (see below); this is kept solely to purge stale persisted
// tokens on first load.
const LEGACY_TOKEN_KEY = "strata.token"

// The access token is short-lived and held in memory only — never persisted —
// so an XSS payload can't read it from storage. Reloads survive via the
// httpOnly refresh cookie, which AuthProvider exchanges for a fresh access
// token on bootstrap (see providers/AuthProvider.tsx + api/axios-instance.ts).
let accessToken: string | null = null

// One-time cleanup: drop any token left behind by the previous localStorage model.
globalThis.localStorage?.removeItem(LEGACY_TOKEN_KEY)

export function getAuthToken(): string | null {
  return accessToken
}

export function setAuthToken(token: string): void {
  accessToken = token
}

export function clearAuthToken(): void {
  accessToken = null
}

export function isAuthenticated(): boolean {
  return accessToken !== null
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

/**
 * Route guard for OWNER-only routes (e.g. database backups, which contain every
 * user's password hash). Stricter than {@link requireAdmin}. The backend
 * independently enforces authorization — this is just UX.
 */
export function requireOwner(): void {
  requireFullAuth()
  const role = store.getState().auth.user?.role
  if (role !== "OWNER") {
    throw redirect({ to: "/databases" })
  }
}
