import { describe, expect, it } from "vitest"

import { setGlobalSearch, setInventoryEngine, uiReducer } from "@/store/uiSlice"

describe("uiSlice", () => {
  it("returns the initial state", () => {
    expect(uiReducer(undefined, { type: "@@INIT" })).toEqual({
      globalSearch: "",
      inventoryEngine: null,
    })
  })

  it("sets the global search query", () => {
    const next = uiReducer(
      { globalSearch: "", inventoryEngine: null },
      setGlobalSearch("orders")
    )
    expect(next.globalSearch).toBe("orders")
  })

  it("remembers the databases list engine filter", () => {
    const picked = uiReducer(undefined, setInventoryEngine("minio"))
    expect(picked.inventoryEngine).toBe("minio")
    expect(
      uiReducer(picked, setInventoryEngine(null)).inventoryEngine
    ).toBeNull()
  })
})
