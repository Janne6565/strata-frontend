import type { CSSProperties } from "react"

interface EngineStyle {
  readonly short: string
  readonly color: string
}

// Engine accent + short tag, matching the Strata prototype's per-engine tints.
const ENGINES: Record<string, EngineStyle> = {
  postgres: { short: "PG", color: "#56a0db" },
  postgresql: { short: "PG", color: "#56a0db" },
  mysql: { short: "MY", color: "#e0a04a" },
  mariadb: { short: "MY", color: "#e0a04a" },
  redis: { short: "RD", color: "#e5575c" },
  mongodb: { short: "MG", color: "#3ecf8e" },
  mongo: { short: "MG", color: "#3ecf8e" },
  influxdb: { short: "IF", color: "#8b7bf0" },
  influx: { short: "IF", color: "#8b7bf0" },
  loki: { short: "LK", color: "#e5a53b" },
  minio: { short: "S3", color: "#d94f6a" },
}

/**
 * How an engine's rows are best presented: logs as a stream, time-series in a
 * timestamp-aware grid, object storage as a folder browser, everything else as
 * a plain SQL table.
 */
export type EngineKind = "log" | "timeseries" | "object" | "sql"

const LOG_ENGINES = new Set(["loki"])
const TIMESERIES_ENGINES = new Set(["influxdb", "influx"])
const OBJECT_ENGINES = new Set(["minio"])

export function engineKind(driver?: string): EngineKind {
  const key = (driver ?? "").toLowerCase()
  if (LOG_ENGINES.has(key)) {
    return "log"
  }
  if (TIMESERIES_ENGINES.has(key)) {
    return "timeseries"
  }
  if (OBJECT_ENGINES.has(key)) {
    return "object"
  }
  return "sql"
}

export function engineStyle(driver?: string): EngineStyle {
  const key = (driver ?? "").toLowerCase()
  return (
    ENGINES[key] ?? {
      short: (driver ?? "DB").slice(0, 2).toUpperCase(),
      color: "#6470e6",
    }
  )
}

/** Inline style for the rounded engine tag (tinted background + border + color). */
export function engineTint(driver?: string): CSSProperties {
  const { color } = engineStyle(driver)
  return { background: `${color}1f`, borderColor: `${color}38`, color }
}
