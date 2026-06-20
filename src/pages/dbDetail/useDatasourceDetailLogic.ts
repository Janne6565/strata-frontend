import { useCallback, useMemo } from "react"

import { renameDatasource } from "@/api/datasources"
import { schema as getSchema } from "@/api/generated/browse/browse"
import { useDataInteractions } from "@/api/useDataInteractions"
import { useDataLoading } from "@/api/useDataLoading"
import { extractProblemDetail } from "@/lib/errors"
import { useDatasources } from "@/store/entityHooks"

/**
 * Reads the datasource metadata from the cached catalog (no per-visit GET), and
 * loads its introspected schema separately, so the header still renders when
 * introspection fails (e.g. a MISSING datasource the engine can't reach).
 */
export function useDatasourceDetailLogic(id: string) {
  const { datasources, refresh } = useDatasources()
  const datasource = useMemo(
    () => datasources.find((d) => d.id === id),
    [datasources, id]
  )
  const schema = useDataLoading(useCallback(() => getSchema(id), [id]))

  // Rename sets the display name, then force-refreshes the cached catalog so the
  // new name shows here and in the list. Returns whether the rename succeeded.
  const { run, status: renameStatus } = useDataInteractions()
  const rename = useCallback(
    async (displayName: string): Promise<boolean> => {
      const ok = await run(() => renameDatasource(id, displayName))
      if (ok) {
        refresh()
      }
      return ok
    },
    [run, refresh, id]
  )

  return {
    datasource,
    tables: schema.data?.tables ?? [],
    schemaStatus: schema.status,
    // The backend's RFC 7807 `detail` so the UI can explain *why* introspection
    // failed (e.g. no backing service) instead of a generic message.
    schemaError: extractProblemDetail(schema.error),
    reloadSchema: schema.reload,
    rename,
    isRenaming: renameStatus === "loading",
  }
}
