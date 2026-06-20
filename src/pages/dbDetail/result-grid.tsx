import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import type { SortState } from "@/pages/dbDetail/filters"
import { parseTimestamp } from "@/lib/time"
import { cn } from "@/lib/utils"

// Above this rendered length a cell is likely truncated, so it becomes click-to-expand.
const EXPAND_THRESHOLD = 48

/** One-line preview of a cell value. */
function renderCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL"
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}

/** Full, pretty-printed cell value for the expand modal. */
function fullCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL"
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

/** Shared columns/rows grid for both the table browser and the query console. */
export function ResultGrid({
  columns,
  rows,
  sort,
  onToggleSort,
  hiddenColumns,
  timeColumns,
}: {
  readonly columns?: readonly string[]
  readonly rows?: readonly unknown[][]
  readonly sort?: SortState | null
  readonly onToggleSort?: (column: string) => void
  /** Columns to drop entirely — e.g. Flux bookkeeping columns for Influx. */
  readonly hiddenColumns?: ReadonlySet<string>
  /** Columns whose values are timestamps and should render as readable dates. */
  readonly timeColumns?: ReadonlySet<string>
}) {
  const { t } = useTranslation()
  const allCols = columns ?? []
  const data = rows ?? []
  // Visible columns keep their original row index so cells stay aligned.
  const visible = allCols
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => !hiddenColumns?.has(name))
  const [expanded, setExpanded] = useState<{
    column: string
    text: string
  } | null>(null)

  if (data.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        {t("detail.noRows")}
      </p>
    )
  }

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="sticky top-0 bg-card text-muted-foreground">
            <tr className="border-b border-border">
              {visible.map(({ name: col }) => {
                const active = sort?.column === col
                return (
                  <th
                    key={col}
                    className="px-3 py-2 font-medium whitespace-nowrap"
                  >
                    {onToggleSort ? (
                      <button
                        type="button"
                        onClick={() => onToggleSort(col)}
                        className={cn(
                          "-mx-1 flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground",
                          active && "text-foreground"
                        )}
                      >
                        {col}
                        {active &&
                          (sort?.direction === "ASC" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          ))}
                      </button>
                    ) : (
                      col
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30"
              >
                {visible.map(({ name: col, index: cellIndex }) => {
                  const cell = row[cellIndex]
                  const isNull = cell === null || cell === undefined
                  const time = timeColumns?.has(col)
                    ? parseTimestamp(cell)
                    : null
                  if (time) {
                    return (
                      <td
                        key={cellIndex}
                        className="max-w-xs px-3 py-1.5 tabular-nums whitespace-nowrap text-muted-foreground"
                        title={time.raw}
                      >
                        <span className="text-foreground">{time.full}</span>
                      </td>
                    )
                  }
                  const text = renderCell(cell)
                  const expandable =
                    !isNull &&
                    (text.length > EXPAND_THRESHOLD || typeof cell === "object")
                  return (
                    <td
                      key={cellIndex}
                      className={cn(
                        "max-w-xs px-3 py-1.5",
                        isNull && "text-muted-foreground/60 italic"
                      )}
                    >
                      {expandable ? (
                        <button
                          type="button"
                          title={t("detail.expandCell")}
                          onClick={() =>
                            setExpanded({
                              column: col,
                              text: fullCell(cell),
                            })
                          }
                          className="block w-full truncate text-left decoration-dotted underline-offset-2 hover:text-foreground hover:underline"
                        >
                          {text}
                        </button>
                      ) : (
                        <span className="block truncate" title={text}>
                          {text}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DialogPrimitive.Root
        open={expanded !== null}
        onOpenChange={(open) => {
          if (!open) {
            setExpanded(null)
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 flex max-h-[70vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <DialogPrimitive.Title className="truncate font-mono text-xs font-medium text-foreground">
                {expanded?.column}
              </DialogPrimitive.Title>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    if (expanded) {
                      void navigator.clipboard?.writeText(expanded.text)
                    }
                  }}
                >
                  <Copy />
                  {t("detail.copy")}
                </Button>
                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("search.close")}
                  >
                    <X />
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </div>
            <pre className="overflow-auto px-4 py-3 font-mono text-xs break-words whitespace-pre-wrap text-foreground">
              {expanded?.text}
            </pre>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
