import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { browse } from "@/api/generated/browse/browse"
import type { RowPage, TableInfo } from "@/api/generated/model"
import { extractProblemDetail } from "@/lib/errors"

const PAGE_SIZE = 50

type Status = "empty" | "loading" | "idle" | "failed"

/** Holds the selected table and pages through its rows via the browse endpoint. */
export function useRowBrowserLogic(id: string) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<TableInfo | null>(null)
  const [page, setPage] = useState<RowPage | null>(null)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState<Status>("empty")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchRows = useCallback(
    async (table: TableInfo, nextOffset: number) => {
      setStatus("loading")
      setErrorMessage(null)
      try {
        const result = await browse(id, table.schema ?? "", table.name ?? "", {
          offset: nextOffset,
          limit: PAGE_SIZE,
        })
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
      setSelected(table)
      void fetchRows(table, 0)
    },
    [fetchRows]
  )

  const next = useCallback(() => {
    if (selected) {
      void fetchRows(selected, offset + PAGE_SIZE)
    }
  }, [selected, offset, fetchRows])

  const prev = useCallback(() => {
    if (selected && offset > 0) {
      void fetchRows(selected, Math.max(0, offset - PAGE_SIZE))
    }
  }, [selected, offset, fetchRows])

  const rowCount = page?.rows?.length ?? 0

  return {
    selected,
    select,
    page,
    status,
    errorMessage,
    offset,
    pageSize: PAGE_SIZE,
    canPrev: offset > 0 && status !== "loading",
    // No total count from the API; a full page means there may be more.
    canNext: rowCount === PAGE_SIZE && status !== "loading",
    next,
    prev,
  }
}
