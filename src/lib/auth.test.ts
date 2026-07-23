import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearAuthToken,
  getAuthToken,
  isAuthenticated,
  setAuthToken,
} from "@/lib/auth"

describe("auth (in-memory access token)", () => {
  beforeEach(() => {
    clearAuthToken()
  })

  afterEach(() => {
    clearAuthToken()
  })

  it("starts with no token", () => {
    expect(getAuthToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it("stores and reads the token from memory, not localStorage", () => {
    setAuthToken("tok-abc")

    expect(getAuthToken()).toBe("tok-abc")
    expect(isAuthenticated()).toBe(true)
    // The whole point of the in-memory model: nothing lands in storage.
    expect(globalThis.localStorage.getItem("strata.token")).toBeNull()
  })

  it("clears the token", () => {
    setAuthToken("tok-abc")
    clearAuthToken()

    expect(getAuthToken()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it("purges a legacy persisted token on module load", async () => {
    globalThis.localStorage.setItem("strata.token", "stale-legacy-token")

    // Re-importing runs the one-time cleanup at the module's top level.
    vi.resetModules()
    await import("@/lib/auth")

    expect(globalThis.localStorage.getItem("strata.token")).toBeNull()
  })
})
