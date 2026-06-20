// Helpers for rendering live resource metrics (see useDatabaseMetrics). Every
// metric is nullable — the backend returns null when a source is unavailable
// (no metrics-server, unreachable database, missing pod limits) — so the
// formatters render an em dash rather than a misleading zero.

const EMPTY = "—"

/** Bar color by utilization: red over 85%, amber over 70%, else indigo. */
export function meterColor(pct: number): string {
  if (pct >= 85) {
    return "#e5575c"
  }
  if (pct >= 70) {
    return "#e5a53b"
  }
  return "#6470e6"
}

/** Human-readable byte size (e.g. "42.5 GB"); null/undefined → em dash. */
export function formatBytes(bytes?: number | null): string {
  if (bytes == null) {
    return EMPTY
  }
  const units = ["B", "KB", "MB", "GB", "TB", "PB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const decimals = unit === 0 || value >= 100 ? 0 : 1
  return `${value.toFixed(decimals)} ${units[unit]}`
}

/** A whole-number metric, or em dash when unavailable. */
export function formatCount(value?: number | null): string {
  return value == null ? EMPTY : value.toLocaleString()
}

/** A percentage metric rounded to a whole number (e.g. "37%"), or em dash. */
export function formatPercent(pct?: number | null): string {
  return pct == null ? EMPTY : `${Math.round(pct)}%`
}

/** "ready/desired" pod count (e.g. "2/3"), or em dash when neither is known. */
export function formatPods(ready?: number | null, desired?: number | null): string {
  if (ready == null && desired == null) {
    return EMPTY
  }
  return `${ready ?? 0}/${desired ?? 0}`
}
