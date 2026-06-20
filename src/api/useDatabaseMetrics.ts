import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { customInstance } from "@/api/axios-instance"

/**
 * Live resource telemetry for one datasource. Every metric is nullable: the
 * backend returns null when a source is unavailable (no metrics-server, no
 * backing workload, unreachable database, missing pod limits).
 *
 * Hand-written for now; once the backend is running, `bun run gen:api` will emit
 * an equivalent `ResourceMetricsResponse` under `api/generated/model` that this
 * can be swapped to.
 */
export interface ResourceMetrics {
  readonly datasourceId: string
  readonly cpuPercent: number | null
  readonly memoryPercent: number | null
  readonly memoryUsageBytes: number | null
  readonly podsReady: number | null
  readonly podsDesired: number | null
  readonly connections: number | null
  readonly dataSizeBytes: number | null
  readonly objectCount: number | null
}

/** How often the metrics poll re-fetches while the view is mounted and focused. */
const METRICS_REFETCH_MS = 5000

function fetchMetrics(ids: readonly string[]): Promise<ResourceMetrics[]> {
  return customInstance<ResourceMetrics[]>({
    url: "/api/v1/datasources/metrics",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { datasourceIds: ids },
  })
}

/**
 * Polls live resource metrics for the given datasources every {@link
 * METRICS_REFETCH_MS} and returns a lookup keyed by datasource id. The request
 * is batched (one call for all ids) and skipped entirely when the id list is
 * empty. Ids are sorted into the query key so reordering doesn't refetch.
 */
export function useDatabaseMetrics(ids: readonly string[]) {
  const sortedIds = useMemo(
    () => [...new Set(ids.filter(Boolean))].sort(),
    [ids]
  )

  const query = useQuery({
    queryKey: ["datasource-metrics", sortedIds.join(",")],
    queryFn: () => fetchMetrics(sortedIds),
    enabled: sortedIds.length > 0,
    refetchInterval: METRICS_REFETCH_MS,
    refetchIntervalInBackground: false,
    staleTime: METRICS_REFETCH_MS,
  })

  const byId = useMemo(() => {
    const map = new Map<string, ResourceMetrics>()
    for (const metrics of query.data ?? []) {
      map.set(metrics.datasourceId, metrics)
    }
    return map
  }, [query.data])

  return { metrics: byId, isLoading: query.isLoading, isError: query.isError }
}
