import { describe, expect, it } from "vitest"

import { moveItem } from "@/lib/reorder"

describe("moveItem", () => {
  it("moves an item down", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
  })

  it("moves an item up", () => {
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"])
  })

  it("is a no-op for an out-of-range source index", () => {
    expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"])
  })

  it("does not mutate the input array", () => {
    const source = ["a", "b", "c"]
    moveItem(source, 0, 2)
    expect(source).toEqual(["a", "b", "c"])
  })
})
