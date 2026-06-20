import { describe, expect, it } from "vitest"

import { deriveStatus, isFresh, STALE_MS } from "@/store/cache"

describe("isFresh (skip-fetch guard)", () => {
  it("fetches when never loaded", () => {
    expect(isFresh({ loading: false, loaded: false, loadedAt: null })).toBe(false)
  })

  it("skips while a request is in flight", () => {
    expect(isFresh({ loading: true, loaded: false, loadedAt: null })).toBe(true)
  })

  it("skips when loaded and still within the stale window", () => {
    expect(
      isFresh({ loading: false, loaded: true, loadedAt: Date.now() })
    ).toBe(true)
  })

  it("refetches once the cache is stale", () => {
    expect(
      isFresh({
        loading: false,
        loaded: true,
        loadedAt: Date.now() - STALE_MS - 1,
      })
    ).toBe(false)
  })

  it("always fetches when forced", () => {
    expect(
      isFresh({ loading: false, loaded: true, loadedAt: Date.now() }, true)
    ).toBe(false)
  })
})

describe("deriveStatus (page-facing)", () => {
  it("is loading before the first load resolves", () => {
    expect(deriveStatus({ loaded: false, loading: true, error: null })).toBe(
      "loading"
    )
  })

  it("is failed when the first load errored", () => {
    expect(deriveStatus({ loaded: false, loading: false, error: "x" })).toBe(
      "failed"
    )
  })

  it("is idle once loaded, even during a background refresh", () => {
    expect(deriveStatus({ loaded: true, loading: true, error: null })).toBe(
      "idle"
    )
  })
})
