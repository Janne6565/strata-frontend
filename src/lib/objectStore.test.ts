import { describe, expect, it } from "vitest"

import {
  breadcrumbs,
  currentPrefix,
  parentPrefix,
  prefixFilters,
} from "@/lib/objectStore"

describe("objectStore", () => {
  it("builds breadcrumbs from the bucket root down", () => {
    expect(breadcrumbs("photos", "2024/raw/")).toEqual([
      { label: "photos", prefix: "" },
      { label: "2024", prefix: "2024/" },
      { label: "raw", prefix: "2024/raw/" },
    ])
    expect(breadcrumbs("photos", "")).toEqual([{ label: "photos", prefix: "" }])
  })

  it("round-trips the prefix through browse filters", () => {
    expect(currentPrefix(prefixFilters("2024/"))).toBe("2024/")
    expect(prefixFilters("")).toEqual([])
    expect(currentPrefix([])).toBe("")
  })

  it("finds the parent folder", () => {
    expect(parentPrefix("2024/raw/")).toBe("2024/")
    expect(parentPrefix("2024/")).toBe("")
    expect(parentPrefix("")).toBe("")
  })
})
