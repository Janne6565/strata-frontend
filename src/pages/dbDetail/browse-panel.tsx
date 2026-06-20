import { Maximize2, Minimize2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { TableInfo } from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { engineKind } from "@/lib/engine"
import { isTimeColumn } from "@/lib/time"
import { FilterBar } from "@/pages/dbDetail/filter-bar"
import { LogView } from "@/pages/dbDetail/log-view"
import { ResultGrid } from "@/pages/dbDetail/result-grid"
import { SchemaTree } from "@/pages/dbDetail/schema-tree"
import type { FilterOp } from "@/pages/dbDetail/filters"
import type { useRowBrowserLogic } from "@/pages/dbDetail/useRowBrowserLogic"

type RowBrowser = ReturnType<typeof useRowBrowserLogic>

// Loki browse only supports label-equality selectors, so gate the filter UI down
// to its label columns and the `=` operator.
const LOG_FILTER_OPS: readonly FilterOp[] = ["eq"]

// Flux bookkeeping columns that carry no meaning in a browsed measurement.
const INFLUX_HIDDEN_COLUMNS: ReadonlySet<string> = new Set([
  "result",
  "table",
  "_start",
  "_stop",
  "_measurement",
])

/**
 * The table browser surface — schema tree + paging toolbar + result grid — shared
 * between the inline tab and the enlarged dialog. Both render against the same
 * `useRowBrowserLogic` instance so selection and paging stay in sync across them.
 */
export function BrowsePanel({
  browser,
  tables,
  driver,
  enlarged,
  onToggleEnlarge,
}: {
  readonly browser: RowBrowser
  readonly tables: readonly TableInfo[]
  readonly driver?: string
  readonly enlarged: boolean
  readonly onToggleEnlarge: () => void
}) {
  const { t } = useTranslation()
  const kind = engineKind(driver)
  const pageColumns = browser.page?.columns ?? []
  const timeColumns =
    kind === "timeseries"
      ? new Set(pageColumns.filter(isTimeColumn))
      : undefined

  // Loki can only be filtered by label equality; other engines filter freely.
  const selectedColumns = browser.selected?.columns ?? []
  const filterColumns =
    kind === "log"
      ? selectedColumns.filter((column) => column.type === "label")
      : selectedColumns

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-64 shrink-0 overflow-auto border-r border-border">
        <SchemaTree
          tables={tables}
          selected={browser.selected}
          onSelect={browser.select}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {browser.selected === null ? (
          <p className="m-auto text-sm text-muted-foreground">
            {t("detail.pickTable")}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <span className="text-sm font-medium">
                {browser.selected.schema
                  ? `${browser.selected.schema}.${browser.selected.name}`
                  : browser.selected.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {t("detail.rowRange", {
                    from: browser.offset + 1,
                    to: browser.offset + (browser.page?.rows?.length ?? 0),
                  })}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={browser.prev}
                  disabled={!browser.canPrev}
                >
                  {t("detail.prev")}
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={browser.next}
                  disabled={!browser.canNext}
                >
                  {t("detail.next")}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={onToggleEnlarge}
                      aria-label={
                        enlarged ? t("detail.collapse") : t("detail.enlarge")
                      }
                    >
                      {enlarged ? <Minimize2 /> : <Maximize2 />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {enlarged ? t("detail.collapse") : t("detail.enlarge")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {filterColumns.length > 0 && (
              <FilterBar
                columns={filterColumns}
                filters={browser.filters}
                onChange={browser.applyFilters}
                ops={kind === "log" ? LOG_FILTER_OPS : undefined}
              />
            )}

            <div className="min-h-0 flex-1 overflow-auto">
              {browser.status === "loading" && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {t("common.loading")}
                </p>
              )}
              {browser.status === "failed" && (
                <p className="p-6 text-center text-sm text-destructive">
                  {browser.errorMessage}
                </p>
              )}
              {browser.status === "idle" &&
                (kind === "log" ? (
                  <LogView
                    columns={browser.page?.columns}
                    rows={browser.page?.rows}
                  />
                ) : (
                  <ResultGrid
                    columns={browser.page?.columns}
                    rows={browser.page?.rows}
                    sort={browser.sort}
                    onToggleSort={browser.toggleSort}
                    hiddenColumns={
                      kind === "timeseries"
                        ? INFLUX_HIDDEN_COLUMNS
                        : undefined
                    }
                    timeColumns={timeColumns}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
