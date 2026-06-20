import { useCallback, useMemo, useState } from "react"

import { rescan as rescanCluster } from "@/api/generated/inventory/inventory"
import type { DatasourceResponse, GroupResponse } from "@/api/generated/model"
import { useDataInteractions } from "@/api/useDataInteractions"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { useDatasources, useGroups } from "@/store/entityHooks"
import { useAppSelector } from "@/store/hooks"

function byPosition(groups: readonly GroupResponse[]): GroupResponse[] {
  return [...groups].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

/**
 * Counts how many group "zones" the shown datasources occupy: every group with
 * at least one shown member, plus one for Unassigned if any shown datasource
 * belongs to no group. Drives the "across N groups" subtitle.
 */
function countOccupiedGroups(
  shown: readonly DatasourceResponse[],
  groups: readonly GroupResponse[]
): number {
  const shownIds = new Set(shown.map((datasource) => datasource.id))
  const assigned = new Set<string>()
  let used = 0
  for (const group of groups) {
    if ((group.datasourceIds ?? []).some((id) => shownIds.has(id))) {
      used += 1
    }
    for (const id of group.datasourceIds ?? []) {
      assigned.add(id)
    }
  }
  const hasUnassigned = shown.some(
    (datasource) => !(datasource.id && assigned.has(datasource.id))
  )
  return used + (hasUnassigned ? 1 : 0)
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
  const [engine, setEngine] = useState<string | null>(null)

  const groups = useMemo(() => byPosition(rawGroups), [rawGroups])

  // Search applies globally (the top-bar query); the engine chip narrows further.
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

  const shown = useMemo(
    () =>
      engine === null
        ? datasources
        : datasources.filter((datasource) => datasource.driver === engine),
    [datasources, engine]
  )

  const groupCount = useMemo(
    () => countOccupiedGroups(shown, groups),
    [shown, groups]
  )

  const rescan = useCallback(async () => {
    const ok = await run(() => rescanCluster())
    if (ok) {
      refresh()
    }
  }, [run, refresh])

  return {
    datasources,
    shown,
    groups,
    groupCount,
    engine,
    setEngine,
    status,
    reload: refresh,
    isAdmin,
    rescan,
    isRescanning: rescanStatus === "loading",
    isFiltered: search !== "",
  }
}
