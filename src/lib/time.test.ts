import { describe, expect, it } from "vitest"

import { isTimeColumn, parseTimestamp } from "@/lib/time"

describe("parseTimestamp", () => {
  // 2024-06-20T13:22:03.123Z, expressed in every precision Loki/Influx emit.
  const utcMs = Date.UTC(2024, 5, 20, 13, 22, 3, 123)

  it("reads Loki nanosecond-epoch strings", () => {
    const nanos = String(utcMs * 1_000_000)
    const parsed = parseTimestamp(nanos)
    expect(parsed).not.toBeNull()
    expect(parsed?.millis).toBe("123")
    expect(parsed?.raw).toBe(nanos) // original value preserved for copy/hover
  })

  it("normalises seconds, millis, micros and nanos to the same instant", () => {
    const seconds = parseTimestamp(Math.floor(utcMs / 1000))
    const millis = parseTimestamp(utcMs)
    const micros = parseTimestamp(utcMs * 1000)
    const nanos = parseTimestamp(utcMs * 1_000_000)
    // Seconds precision drops sub-second detail; compare to the clock only.
    expect(millis?.clock).toBe(micros?.clock)
    expect(micros?.clock).toBe(nanos?.clock)
    expect(seconds?.clock).toBe(millis?.clock)
    expect(millis?.millis).toBe("123")
  })

  it("parses ISO-8601 instants (Influx _time)", () => {
    const parsed = parseTimestamp("2024-06-20T13:22:03.123Z")
    expect(parsed?.millis).toBe("123")
    expect(parsed?.raw).toBe("2024-06-20T13:22:03.123Z")
  })

  it("returns null for non-timestamps", () => {
    expect(parseTimestamp("hello")).toBeNull()
    expect(parseTimestamp(null)).toBeNull()
    expect(parseTimestamp(42)).toBeNull() // too small to be an epoch
    expect(parseTimestamp({})).toBeNull()
  })
})

describe("isTimeColumn", () => {
  it("matches known time column names", () => {
    expect(isTimeColumn("_time")).toBe(true)
    expect(isTimeColumn("time")).toBe(true)
    expect(isTimeColumn("timestamp")).toBe(true)
    expect(isTimeColumn("created_time")).toBe(true)
  })

  it("ignores ordinary columns", () => {
    expect(isTimeColumn("value")).toBe(false)
    expect(isTimeColumn("host")).toBe(false)
  })
})
