import { redirect } from "@tanstack/react-router"

export const AUTH_TOKEN_KEY = "strata.token"

export function getAuthToken(): string | null {
  return globalThis.localStorage.getItem(AUTH_TOKEN_KEY)
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
