import { useCallback, useMemo } from "react"

import {
  list2 as listDatasources,
  rescan as rescanCluster,
} from "@/api/generated/inventory/inventory"
import { useDataInteractions } from "@/api/useDataInteractions"
import { useDataLoading } from "@/api/useDataLoading"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { useAppSelector } from "@/store/hooks"

/**
 * Loads the datasource catalog, filters it by the global search query, and
 * (for admins) exposes a rescan that reconciles the cluster then reloads.
 */
export function useInventoryLogic() {
  const { isAdmin } = useAuthInformation()
  const search = useAppSelector((state) => state.ui.globalSearch)
    .trim()
    .toLowerCase()

  const loader = useCallback(() => listDatasources(), [])
  const { data, status, error, reload } = useDataLoading(loader)
  const { status: rescanStatus, run } = useDataInteractions()

  const datasources = useMemo(() => {
    const all = data ?? []
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
  }, [data, search])

  const rescan = useCallback(async () => {
    const summary = await run(() => rescanCluster())
    if (summary) {
      reload()
    }
  }, [run, reload])

  return {
    datasources,
    status,
    error,
    reload,
    isAdmin,
    rescan,
    isRescanning: rescanStatus === "loading",
    isFiltered: search !== "",
    total: data?.length ?? 0,
  }
}
