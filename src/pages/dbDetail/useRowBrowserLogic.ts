import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { browse } from "@/api/generated/browse/browse"
import type { BrowseParams, RowPage, TableInfo } from "@/api/generated/model"
import { extractProblemDetail } from "@/lib/errors"
import type { ColumnFilter, SortState } from "@/pages/dbDetail/filters"
import { toWireFilter } from "@/pages/dbDetail/filters"

const PAGE_SIZE = 50

type Status = "empty" | "loading" | "idle" | "failed"

/**
 * Holds the selected table and pages through its rows via the browse endpoint,
 * pushing sort + column filters to the server so they apply across the whole
 * table (not just the loaded page). Sort/filter changes refetch from offset 0.
 */
export function useRowBrowserLogic(id: string) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<TableInfo | null>(null)
  const [page, setPage] = useState<RowPage | null>(null)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState<Status>("empty")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState | null>(null)
  const [filters, setFilters] = useState<readonly ColumnFilter[]>([])

  // Sort/filter are passed explicitly so callbacks never read stale closures.
  const fetchRows = useCallback(
    async (
      table: TableInfo,
      nextOffset: number,
      nextSort: SortState | null,
      nextFilters: readonly ColumnFilter[]
    ) => {
      setStatus("loading")
      setErrorMessage(null)
      try {
        const params: BrowseParams = { offset: nextOffset, limit: PAGE_SIZE }
        if (nextSort) {
          params.orderBy = nextSort.column
          params.direction = nextSort.direction
        }
        if (nextFilters.length > 0) {
          params.filter = nextFilters.map(toWireFilter)
        }
        const result = await browse(
          id,
          table.schema ?? "",
          table.name ?? "",
          params
        )
        setPage(result)
        setOffset(nextOffset)
        setStatus("idle")
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("detail.browseError"))
        setStatus("failed")
      }
    },
    [id, t]
  )

  const select = useCallback(
    (table: TableInfo) => {
      // Sort/filter reference columns, so reset them when switching tables.
      setSelected(table)
      setSort(null)
      setFilters([])
      void fetchRows(table, 0, null, [])
    },
    [fetchRows]
  )

  // Cycle a column through ASC → DESC → unsorted; a new column starts at ASC.
  const toggleSort = useCallback(
    (column: string) => {
      if (!selected) {
        return
      }
      const next: SortState | null =
        !sort || sort.column !== column
          ? { column, direction: "ASC" }
          : sort.direction === "ASC"
            ? { column, direction: "DESC" }
            : null
      setSort(next)
      void fetchRows(selected, 0, next, filters)
    },
    [selected, sort, filters, fetchRows]
  )

  const applyFilters = useCallback(
    (next: readonly ColumnFilter[]) => {
      if (!selected) {
        return
      }
      setFilters(next)
      void fetchRows(selected, 0, sort, next)
    },
    [selected, sort, fetchRows]
  )

  const next = useCallback(() => {
    if (selected) {
      void fetchRows(selected, offset + PAGE_SIZE, sort, filters)
    }
  }, [selected, offset, sort, filters, fetchRows])

  const prev = useCallback(() => {
    if (selected && offset > 0) {
      void fetchRows(selected, Math.max(0, offset - PAGE_SIZE), sort, filters)
    }
  }, [selected, offset, sort, filters, fetchRows])

  const rowCount = page?.rows?.length ?? 0

  return {
    selected,
    select,
    page,
    status,
    errorMessage,
    offset,
    pageSize: PAGE_SIZE,
    sort,
    toggleSort,
    filters,
    applyFilters,
    canPrev: offset > 0 && status !== "loading",
    // No total count from the API; a full page means there may be more.
    canNext: rowCount === PAGE_SIZE && status !== "loading",
    next,
    prev,
  }
}
