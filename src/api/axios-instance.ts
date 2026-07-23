import axios from "axios"
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth"

// Base URL for both the generated client and the raw refresh call below. Empty
// in prod/dev (same-origin or Vite-proxied); the generated URLs already carry
// the full `/api/v1/...` path, so keeping this empty avoids doubling it.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

// Refresh endpoint that trades the httpOnly refresh cookie for a new access token.
const REFRESH_URL = `${API_BASE_URL}/api/v1/auth/token`

const api = axios.create({
  baseURL: API_BASE_URL,
  // Send the httpOnly refresh cookie on every call so the silent refresh works.
  withCredentials: true,
})

// Attach the in-memory bearer token to every request.
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Flag set on a request config once it has been through one silent-refresh
// retry, so a second 401 doesn't loop forever.
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

// Raw refresh call — deliberately NOT routed through `api`/customInstance, so a
// 401 on the refresh itself can't recurse back into this interceptor. Relies on
// the browser sending the httpOnly refresh cookie (withCredentials).
async function refreshAccessToken(): Promise<string> {
  const response = await axios.post<{ token?: string }>(REFRESH_URL, undefined, {
    withCredentials: true,
  })
  const token = response.data.token
  if (!token) {
    throw new Error("Refresh response contained no access token")
  }
  return token
}

// On 401, try ONE silent refresh and replay the original request. The auth flow
// endpoints are exempt: a 401 on /auth/login is "bad credentials" (surfaced
// inline by the login form) and a 401 on /auth/token means the session is truly
// gone — neither should trigger a refresh-retry. If the refresh fails, drop the
// token and bounce to login (the router guard catches the rest).
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const config = error.config as RetryableConfig | undefined
    const url = config?.url ?? ""
    const isAuthFlow = url.includes("/auth/login") || url.includes("/auth/token")

    if (!config || isAuthFlow || config._retried) {
      return Promise.reject(error)
    }

    config._retried = true
    try {
      const token = await refreshAccessToken()
      setAuthToken(token)
      config.headers.Authorization = `Bearer ${token}`
      return await api(config)
    } catch (refreshError) {
      clearAuthToken()
      globalThis.location.assign("/login")
      return Promise.reject(refreshError)
    }
  }
)

/**
 * Mutator injected into every Orval-generated call (see orval.config.ts) so base
 * URL, auth headers, and error handling are configured once.
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => api<T>({ ...config, ...options }).then((response) => response.data)

export default customInstance
