import { useCallback, useMemo } from "react"

import { rescan as rescanCluster } from "@/api/generated/inventory/inventory"
import type { GroupResponse } from "@/api/generated/model"
import { useDataInteractions } from "@/api/useDataInteractions"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { useDatasources, useGroups } from "@/store/entityHooks"
import { useAppSelector } from "@/store/hooks"

function byPosition(groups: readonly GroupResponse[]): GroupResponse[] {
  return [...groups].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

/**
 * Reads the cached datasource catalog + groups from the store (fetched once and
 * reused across screens), filters by the global search query, and exposes a
 * rescan that reconciles the cluster then force-refreshes the catalog.
 */
export function useInventoryLogic() {
  const { isAdmin } = useAuthInformation()
  const search = useAppSelector((state) => state.ui.globalSearch)
    .trim()
    .toLowerCase()

  const { datasources: all, status, refresh } = useDatasources()
  const { groups: rawGroups } = useGroups()
  const { status: rescanStatus, run } = useDataInteractions()

  const groups = useMemo(() => byPosition(rawGroups), [rawGroups])

  const datasources = useMemo(() => {
    if (search === "") {
      return all
    }
    return all.filter((datasource) =>
      [
        datasource.displayName,
        datasource.driver,
        datasource.namespace,
        datasource.workloadName,
      ].some((field) => field?.toLowerCase().includes(search))
    )
  }, [all, search])

  const rescan = useCallback(async () => {
    const summary = await run(() => rescanCluster())
    if (summary) {
      refresh()
    }
  }, [run, refresh])

  return {
    datasources,
    groups,
    status,
    reload: refresh,
    isAdmin,
    rescan,
    isRescanning: rescanStatus === "loading",
    isFiltered: search !== "",
  }
}
