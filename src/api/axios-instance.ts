import axios from "axios"
import type { AxiosRequestConfig } from "axios"

import { AUTH_TOKEN_KEY, getAuthToken } from "@/lib/auth"

// Generated request URLs already carry the full `/api/v1/...` path (the backend
// adds the `/api` prefix centrally, so it appears in the OpenAPI spec). Keep the
// baseURL empty so we don't double it — same-origin in prod, Vite-proxied in dev.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
})

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, drop the token and bounce to login (the router guard catches the rest).
// The login request is exempt: a 401 there means "bad credentials", which the
// login form surfaces inline — redirecting would discard the error and reload.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login")
      if (!isLoginRequest) {
        globalThis.localStorage.removeItem(AUTH_TOKEN_KEY)
        globalThis.location.assign("/login")
      }
    }
    return Promise.reject(error)
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
