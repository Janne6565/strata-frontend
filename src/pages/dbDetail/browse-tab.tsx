import { useTranslation } from "react-i18next"

import type { TableInfo } from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import { ResultGrid } from "@/pages/dbDetail/result-grid"
import { SchemaTree } from "@/pages/dbDetail/schema-tree"
import { useRowBrowserLogic } from "@/pages/dbDetail/useRowBrowserLogic"

export function BrowseTab({
  id,
  tables,
}: {
  readonly id: string
  readonly tables: readonly TableInfo[]
}) {
  const { t } = useTranslation()
  const browser = useRowBrowserLogic(id)

  return (
    <div className="flex h-[60vh] overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-64 shrink-0 overflow-auto border-r border-border">
        <SchemaTree
          tables={tables}
          selected={browser.selected}
          onSelect={browser.select}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {browser.selected === null ? (
          <p className="text-muted-foreground m-auto text-sm">
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
                <span className="text-muted-foreground text-xs">
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
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {browser.status === "loading" && (
                <p className="text-muted-foreground p-6 text-center text-sm">
                  {t("common.loading")}
                </p>
              )}
              {browser.status === "failed" && (
                <p className="text-destructive p-6 text-center text-sm">
                  {browser.errorMessage}
                </p>
              )}
              {browser.status === "idle" && (
                <ResultGrid
                  columns={browser.page?.columns}
                  rows={browser.page?.rows}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
