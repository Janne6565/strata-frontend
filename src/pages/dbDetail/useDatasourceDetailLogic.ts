import { useCallback } from "react"

import { schema as getSchema } from "@/api/generated/browse/browse"
import { get as getDatasource } from "@/api/generated/inventory/inventory"
import { useDataLoading } from "@/api/useDataLoading"

/**
 * Loads a datasource's metadata (header) and its introspected schema (tree)
 * independently, so the header still renders when introspection fails (e.g. a
 * MISSING datasource the engine can't reach).
 */
export function useDatasourceDetailLogic(id: string) {
  const datasource = useDataLoading(useCallback(() => getDatasource(id), [id]))
  const schema = useDataLoading(useCallback(() => getSchema(id), [id]))

  return {
    datasource: datasource.data,
    datasourceStatus: datasource.status,
    tables: schema.data?.tables ?? [],
    schemaStatus: schema.status,
    reloadSchema: schema.reload,
  }
}
