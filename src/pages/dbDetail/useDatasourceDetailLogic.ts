import { useCallback, useMemo } from "react"

import { schema as getSchema } from "@/api/generated/browse/browse"
import { useDataLoading } from "@/api/useDataLoading"
import { extractProblemDetail } from "@/lib/errors"
import { useDatasources } from "@/store/entityHooks"

/**
 * Reads the datasource metadata from the cached catalog (no per-visit GET), and
 * loads its introspected schema separately, so the header still renders when
 * introspection fails (e.g. a MISSING datasource the engine can't reach).
 */
export function useDatasourceDetailLogic(id: string) {
  const { datasources } = useDatasources()
  const datasource = useMemo(
    () => datasources.find((d) => d.id === id),
    [datasources, id]
  )
  const schema = useDataLoading(useCallback(() => getSchema(id), [id]))

  return {
    datasource,
    tables: schema.data?.tables ?? [],
    schemaStatus: schema.status,
    // The backend's RFC 7807 `detail` so the UI can explain *why* introspection
    // failed (e.g. no backing service) instead of a generic message.
    schemaError: extractProblemDetail(schema.error),
    reloadSchema: schema.reload,
  }
}
