import axios, { AxiosError } from "axios"
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { customInstance } from "@/api/axios-instance"
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth"

// Builds an adapter that returns the given status codes across successive calls,
// recording the Authorization header seen on each call. A custom adapter is
// responsible for enforcing validateStatus itself (axios only does that inside
// its built-in adapters), so non-2xx statuses reject with an AxiosError carrying
// the response — exactly what the interceptor keys off.
function scriptedAdapter(statuses: number[]): {
  adapter: AxiosAdapter
  authHeaders: (string | undefined)[]
} {
  const authHeaders: (string | undefined)[] = []
  let call = 0
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    const status = statuses[call] ?? 200
    call += 1
    authHeaders.push(config.headers.Authorization as string | undefined)
    const response = {
      data: status >= 200 && status < 300 ? { ok: true } : {},
      status,
      statusText: "",
      headers: {},
      config,
    }
    if (status >= 200 && status < 300) {
      return Promise.resolve(response)
    }
    return Promise.reject(
      new AxiosError("request failed", AxiosError.ERR_BAD_REQUEST, config, null, response)
    )
  }
  return { adapter, authHeaders }
}

describe("axios-instance 401 handling", () => {
  // jsdom's location.assign is non-configurable, so stub the whole location
  // object with a spy the interceptor can call.
  const originalLocation = globalThis.location
  let assignMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    clearAuthToken()
    assignMock = vi.fn()
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { assign: assignMock },
    })
  })

  afterEach(() => {
    clearAuthToken()
    vi.restoreAllMocks()
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("silently refreshes on 401, then replays the original request with the new token", async () => {
    setAuthToken("stale")
    const postSpy = vi
      .spyOn(axios, "post")
      .mockResolvedValueOnce({ data: { token: "fresh" } })
    const { adapter, authHeaders } = scriptedAdapter([401, 200])

    const result = await customInstance<{ ok: boolean }>(
      { url: "/api/v1/datasources", method: "GET" },
      { adapter }
    )

    expect(result).toEqual({ ok: true })
    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy.mock.calls[0][0]).toContain("/api/v1/auth/token")
    // First attempt carried the stale token; the retry carries the refreshed one.
    expect(authHeaders).toEqual(["Bearer stale", "Bearer fresh"])
    expect(getAuthToken()).toBe("fresh")
    expect(assignMock).not.toHaveBeenCalled()
  })

  it("clears the token and redirects to /login when the refresh itself fails", async () => {
    setAuthToken("stale")
    vi.spyOn(axios, "post").mockRejectedValueOnce(new Error("no cookie"))
    const { adapter } = scriptedAdapter([401])

    await expect(
      customInstance({ url: "/api/v1/datasources", method: "GET" }, { adapter })
    ).rejects.toBeDefined()

    expect(getAuthToken()).toBeNull()
    expect(assignMock).toHaveBeenCalledWith("/login")
  })

  it("does not attempt a refresh when the token endpoint itself 401s", async () => {
    const postSpy = vi.spyOn(axios, "post")
    const { adapter } = scriptedAdapter([401])

    await expect(
      customInstance({ url: "/api/v1/auth/token", method: "POST" }, { adapter })
    ).rejects.toBeDefined()

    expect(postSpy).not.toHaveBeenCalled()
    expect(assignMock).not.toHaveBeenCalled()
  })

  it("does not attempt a refresh when login 401s (bad credentials)", async () => {
    const postSpy = vi.spyOn(axios, "post")
    const { adapter } = scriptedAdapter([401])

    await expect(
      customInstance({ url: "/api/v1/auth/login", method: "POST" }, { adapter })
    ).rejects.toBeDefined()

    expect(postSpy).not.toHaveBeenCalled()
    expect(assignMock).not.toHaveBeenCalled()
  })
})
