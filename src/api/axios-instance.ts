import axios from "axios"
import type { AxiosRequestConfig } from "axios"

import { AUTH_TOKEN_KEY, getAuthToken } from "@/lib/auth"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
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
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      globalThis.localStorage.removeItem(AUTH_TOKEN_KEY)
      globalThis.location.assign("/login")
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
