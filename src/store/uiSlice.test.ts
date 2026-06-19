import { describe, expect, it } from "vitest"

import { setGlobalSearch, uiReducer } from "@/store/uiSlice"

describe("uiSlice", () => {
  it("returns the initial state", () => {
    expect(uiReducer(undefined, { type: "@@INIT" })).toEqual({ globalSearch: "" })
  })

  it("sets the global search query", () => {
    const next = uiReducer({ globalSearch: "" }, setGlobalSearch("orders"))
    expect(next.globalSearch).toBe("orders")
  })
})
