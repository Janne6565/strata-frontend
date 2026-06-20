import { describe, expect, it } from "vitest"

import {
  isGrantScopeValid,
  isNonBlank,
  meetsPasswordPolicy,
  PASSWORD_MIN,
} from "@/lib/validators"

describe("isNonBlank", () => {
  it("rejects empty and whitespace-only strings", () => {
    expect(isNonBlank("")).toBe(false)
    expect(isNonBlank("   ")).toBe(false)
  })

  it("accepts strings with non-whitespace content", () => {
    expect(isNonBlank("a")).toBe(true)
    expect(isNonBlank("  x  ")).toBe(true)
  })
})

describe("meetsPasswordPolicy", () => {
  it("requires at least PASSWORD_MIN characters", () => {
    expect(meetsPasswordPolicy("a".repeat(PASSWORD_MIN - 1))).toBe(false)
    expect(meetsPasswordPolicy("a".repeat(PASSWORD_MIN))).toBe(true)
  })

  it("does not trim — counts whitespace toward length", () => {
    expect(meetsPasswordPolicy(" ".repeat(PASSWORD_MIN))).toBe(true)
  })
})

describe("isGrantScopeValid", () => {
  it("requires a non-blank namespace for NAMESPACE scope", () => {
    expect(isGrantScopeValid("NAMESPACE", "", "ds-1")).toBe(false)
    expect(isGrantScopeValid("NAMESPACE", "  ", "")).toBe(false)
    expect(isGrantScopeValid("NAMESPACE", "team-a", "")).toBe(true)
  })

  it("requires a datasource for DATABASE scope", () => {
    expect(isGrantScopeValid("DATABASE", "team-a", "")).toBe(false)
    expect(isGrantScopeValid("DATABASE", "", "ds-1")).toBe(true)
  })
})
