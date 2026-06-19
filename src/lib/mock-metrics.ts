// PLACEHOLDER telemetry. The backend doesn't expose live cluster metrics yet, so
// these are derived deterministically from the datasource id — stable per database,
// not real. Replace with a metrics endpoint when cluster telemetry is wired.

export interface MockMetrics {
  readonly cpuPct: number
  readonly memPct: number
  readonly storagePct: number
  readonly conns: number
  readonly pods: number
  readonly dataSize: string
  readonly objects: number
}

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function mockMetrics(id: string): MockMetrics {
  const h = hash(id)
  const cpuPct = 8 + (h % 70)
  const memPct = 20 + ((h >> 3) % 65)
  const storagePct = 12 + ((h >> 6) % 78)
  const conns = 2 + ((h >> 9) % 58)
  const pods = 1 + ((h >> 12) % 3)
  const dataSize = `${(1 + (h % 900) / 10).toFixed(1)} GB`
  const objects = 6 + (h % 240)
  return { cpuPct, memPct, storagePct, conns, pods, dataSize, objects }
}

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
