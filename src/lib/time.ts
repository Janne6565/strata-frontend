/**
 * Timestamp parsing for the row browser. Time-series and log engines hand us
 * timestamps in wildly different shapes — Loki sends nanosecond-epoch strings
 * (e.g. "1718894523123456789"), Influx sends ISO instants — so we normalise
 * any plausible epoch (by magnitude) or ISO string to a readable local time.
 */

export interface ParsedTime {
  /** Calendar date, e.g. "2026-06-20". */
  readonly date: string
  /** Wall clock, e.g. "14:32:03". */
  readonly clock: string
  /** Zero-padded milliseconds, e.g. "123". */
  readonly millis: string
  /** Combined "date clock.millis" for grid cells and tooltips. */
  readonly full: string
  /** The original value, kept for copy/hover so nothing is lost. */
  readonly raw: string
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0")
}

/**
 * Coerce a numeric epoch of unknown precision to milliseconds. Seconds, millis,
 * micros and nanos all land in distinct magnitude bands for any realistic date,
 * so we can disambiguate without being told the unit.
 */
function epochToMillis(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }
  if (value >= 1e17) {
    return value / 1e6 // nanoseconds
  }
  if (value >= 1e14) {
    return value / 1e3 // microseconds
  }
  if (value >= 1e11) {
    return value // milliseconds
  }
  if (value >= 1e8) {
    return value * 1e3 // seconds
  }
  return null
}

/** Parse an epoch number/string or ISO string into local-time parts, or null. */
export function parseTimestamp(value: unknown): ParsedTime | null {
  let ms: number | null
  let raw: string

  if (typeof value === "number") {
    raw = String(value)
    ms = epochToMillis(value)
  } else if (typeof value === "string") {
    raw = value
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) {
      ms = epochToMillis(Number(trimmed))
    } else {
      const parsed = Date.parse(trimmed)
      ms = Number.isNaN(parsed) ? null : parsed
    }
  } else {
    return null
  }

  if (ms === null) {
    return null
  }
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  const millis = pad(date.getMilliseconds(), 3)
  return { date: datePart, clock, millis, full: `${datePart} ${clock}.${millis}`, raw }
}

/** Column names that should be rendered as timestamps in the time-series grid. */
export function isTimeColumn(name: string): boolean {
  const lower = name.toLowerCase()
  return (
    lower === "_time" ||
    lower === "time" ||
    lower === "timestamp" ||
    lower.endsWith("_time")
  )
}
