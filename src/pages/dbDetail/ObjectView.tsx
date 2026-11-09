import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CornerLeftUp,
  File,
  Folder,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { formatBytes } from "@/lib/metrics"
import { breadcrumbs, parentPrefix } from "@/lib/objectStore"
import { parseTimestamp } from "@/lib/time"
import { cn } from "@/lib/utils"
import type { SortState } from "@/pages/dbDetail/filters"

// Sortable columns, in display order, keyed by the backend's column names.
const COLUMNS = [
  { key: "name", label: "detail.objects.name", align: "left" },
  { key: "size", label: "detail.objects.size", align: "right" },
  { key: "last_modified", label: "detail.objects.modified", align: "left" },
] as const

/**
 * Folder-style listing of one MinIO bucket level: a breadcrumb path, folders
 * first, then objects with their size and modification time. Folder rows (and
 * crumbs) navigate by calling `onOpen` with the prefix to list next.
 */
export function ObjectView({
  bucket,
  prefix,
  columns,
  rows,
  sort,
  onToggleSort,
  onOpen,
}: {
  readonly bucket: string
  readonly prefix: string
  readonly columns?: readonly string[]
  readonly rows?: readonly unknown[][]
  readonly sort: SortState | null
  readonly onToggleSort: (column: string) => void
  readonly onOpen: (prefix: string) => void
}) {
  const { t } = useTranslation()
  const index = (name: string) => (columns ?? []).indexOf(name)
  const col = {
    name: index("name"),
    key: index("key"),
    type: index("type"),
    size: index("size"),
    modified: index("last_modified"),
  }
  const data = rows ?? []
  const crumbs = breadcrumbs(bucket, prefix)

  return (
    <div className="flex flex-col">
      <nav
        aria-label={t("detail.objects.path")}
        className="flex flex-wrap items-center gap-0.5 border-b border-border px-3 py-1.5 font-mono text-xs"
      >
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1
          return (
            <span key={crumb.prefix} className="flex items-center gap-0.5">
              {i > 0 && (
                <ChevronRight className="size-3 text-muted-foreground/60" />
              )}
              <button
                type="button"
                onClick={() => onOpen(crumb.prefix)}
                disabled={last}
                aria-current={last ? "page" : undefined}
                className={cn(
                  "rounded px-1 py-0.5",
                  last
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {crumb.label}
              </button>
            </span>
          )
        })}
      </nav>

      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-card text-muted-foreground">
          <tr className="border-b border-border">
            {COLUMNS.map((column) => {
              const active = sort?.column === column.key
              return (
                <th
                  key={column.key}
                  className={cn(
                    "px-3 py-2 font-medium whitespace-nowrap",
                    column.align === "right" && "text-right"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.key)}
                    className={cn(
                      "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground",
                      active && "text-foreground"
                    )}
                  >
                    {t(column.label)}
                    {active &&
                      (sort?.direction === "ASC" ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      ))}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {prefix !== "" && (
            <tr className="border-b border-border/50 hover:bg-muted/30">
              <td colSpan={COLUMNS.length} className="px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => onOpen(parentPrefix(prefix))}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <CornerLeftUp className="size-3.5" />
                  ..
                </button>
              </td>
            </tr>
          )}
          {data.map((row) => {
            const key = String(row[col.key] ?? "")
            const name = String(row[col.name] ?? key)
            const isFolder = row[col.type] === "folder"
            const size = row[col.size]
            const modified = parseTimestamp(row[col.modified])
            return (
              <tr
                key={key}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30"
              >
                <td className="max-w-md px-3 py-1.5">
                  {isFolder ? (
                    <button
                      type="button"
                      onClick={() => onOpen(key)}
                      className="flex max-w-full items-center gap-2 text-left hover:underline"
                    >
                      <Folder className="size-3.5 shrink-0 text-[#e5a53b]" />
                      <span className="truncate">{name}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-2" title={key}>
                      <File className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{name}</span>
                    </span>
                  )}
                </td>
                <td
                  className="px-3 py-1.5 text-right font-mono whitespace-nowrap tabular-nums"
                  title={
                    typeof size === "number"
                      ? `${size.toLocaleString()} B`
                      : undefined
                  }
                >
                  {typeof size === "number" ? formatBytes(size) : ""}
                </td>
                <td
                  className="px-3 py-1.5 font-mono whitespace-nowrap text-muted-foreground tabular-nums"
                  title={modified?.raw}
                >
                  {modified ? `${modified.date} ${modified.clock}` : ""}
                </td>
              </tr>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="p-6 text-center text-sm text-muted-foreground"
              >
                {t("detail.objects.empty")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
