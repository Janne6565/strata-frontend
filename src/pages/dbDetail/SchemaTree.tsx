import { Archive, Table2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { TableInfo } from "@/api/generated/model"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { EngineKind } from "@/lib/engine"
import { formatBytes, formatCount } from "@/lib/metrics"
import { cn } from "@/lib/utils"

function qualifiedName(table: TableInfo): string {
  return table.schema ? `${table.schema}.${table.name}` : (table.name ?? "—")
}

export function SchemaTree({
  tables,
  kind,
  selected,
  onSelect,
}: {
  readonly tables: readonly TableInfo[]
  /** Object storage lists buckets (with their size) instead of tables. */
  readonly kind?: EngineKind
  readonly selected: TableInfo | null
  readonly onSelect: (table: TableInfo) => void
}) {
  const { t } = useTranslation()
  const isObject = kind === "object"

  if (tables.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        {isObject ? t("detail.objects.noBuckets") : t("detail.noTables")}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5 p-2">
      {tables.map((table) => {
        const name = qualifiedName(table)
        const isSelected = selected !== null && qualifiedName(selected) === name
        return (
          <li key={name}>
            <button
              type="button"
              onClick={() => onSelect(table)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-muted"
              )}
            >
              {isObject ? (
                <Archive className="text-muted-foreground size-3.5 shrink-0" />
              ) : (
                <Table2 className="text-muted-foreground size-3.5 shrink-0" />
              )}
              <span className="truncate">
                {isObject ? (table.name ?? name) : name}
              </span>
              {isObject && table.sizeBytes != null ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground ml-auto text-xs whitespace-nowrap tabular-nums">
                      {formatBytes(table.sizeBytes)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("detail.objects.bucketSize", {
                      count: table.rowCount ?? 0,
                    })}
                  </TooltipContent>
                </Tooltip>
              ) : (
                table.rowCount != null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      ~{formatCount(table.rowCount)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t("detail.rowCountTitle")}</TooltipContent>
                </Tooltip>
                )
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
