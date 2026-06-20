import { Table2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { TableInfo } from "@/api/generated/model"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCount } from "@/lib/metrics"
import { cn } from "@/lib/utils"

function qualifiedName(table: TableInfo): string {
  return table.schema ? `${table.schema}.${table.name}` : (table.name ?? "—")
}

export function SchemaTree({
  tables,
  selected,
  onSelect,
}: {
  readonly tables: readonly TableInfo[]
  readonly selected: TableInfo | null
  readonly onSelect: (table: TableInfo) => void
}) {
  const { t } = useTranslation()

  if (tables.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">{t("detail.noTables")}</p>
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
              <Table2 className="text-muted-foreground size-3.5 shrink-0" />
              <span className="truncate">{name}</span>
              {table.rowCount != null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      ~{formatCount(table.rowCount)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t("detail.rowCountTitle")}</TooltipContent>
                </Tooltip>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
