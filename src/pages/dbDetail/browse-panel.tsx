import { Maximize2, Minimize2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { TableInfo } from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/pages/dbDetail/filter-bar"
import { ResultGrid } from "@/pages/dbDetail/result-grid"
import { SchemaTree } from "@/pages/dbDetail/schema-tree"
import type { useRowBrowserLogic } from "@/pages/dbDetail/useRowBrowserLogic"

type RowBrowser = ReturnType<typeof useRowBrowserLogic>

/**
 * The table browser surface — schema tree + paging toolbar + result grid — shared
 * between the inline tab and the enlarged dialog. Both render against the same
 * `useRowBrowserLogic` instance so selection and paging stay in sync across them.
 */
export function BrowsePanel({
  browser,
  tables,
  enlarged,
  onToggleEnlarge,
}: {
  readonly browser: RowBrowser
  readonly tables: readonly TableInfo[]
  readonly enlarged: boolean
  readonly onToggleEnlarge: () => void
}) {
  const { t } = useTranslation()

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
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={onToggleEnlarge}
                  title={enlarged ? t("detail.collapse") : t("detail.enlarge")}
                  aria-label={
                    enlarged ? t("detail.collapse") : t("detail.enlarge")
                  }
                >
                  {enlarged ? <Minimize2 /> : <Maximize2 />}
                </Button>
              </div>
            </div>

            <FilterBar
              columns={browser.selected.columns ?? []}
              filters={browser.filters}
              onChange={browser.applyFilters}
            />

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
              {browser.status === "idle" && (
                <ResultGrid
                  columns={browser.page?.columns}
                  rows={browser.page?.rows}
                  sort={browser.sort}
                  onToggleSort={browser.toggleSort}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
