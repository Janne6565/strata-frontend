import { useState } from "react"
import { Plus, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { ColumnInfo } from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ColumnFilter, FilterOp } from "@/pages/dbDetail/filters"
import { opNeedsValue } from "@/pages/dbDetail/filters"

const OPS: readonly { value: FilterOp; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "ne", label: "≠" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "like", label: "contains" },
  { value: "isnull", label: "is null" },
  { value: "isnotnull", label: "is not null" },
]

const SELECT =
  "h-7 rounded-md border border-input bg-[#111217] px-2 text-xs text-foreground outline-none focus-visible:border-ring"

function opLabel(op: FilterOp): string {
  return OPS.find((entry) => entry.value === op)?.label ?? op
}

/** Compact column-filter builder: pick column + operator (+ value), add as a chip. */
export function FilterBar({
  columns,
  filters,
  onChange,
}: {
  readonly columns: readonly ColumnInfo[]
  readonly filters: readonly ColumnFilter[]
  readonly onChange: (filters: readonly ColumnFilter[]) => void
}) {
  const { t } = useTranslation()
  const names = columns.map((column) => column.name ?? "").filter(Boolean)
  const [column, setColumn] = useState("")
  const [op, setOp] = useState<FilterOp>("eq")
  const [value, setValue] = useState("")

  const effectiveColumn = column || names[0] || ""
  const needsValue = opNeedsValue(op)
  const canAdd = effectiveColumn !== "" && (!needsValue || value !== "")

  function add() {
    if (!canAdd) {
      return
    }
    onChange([
      ...filters,
      { column: effectiveColumn, op, value: needsValue ? value : "" },
    ])
    setValue("")
  }

  function removeAt(index: number) {
    onChange(filters.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          className={SELECT}
          value={effectiveColumn}
          onChange={(event) => setColumn(event.target.value)}
          aria-label={t("detail.filterColumn")}
        >
          {names.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          className={SELECT}
          value={op}
          onChange={(event) => setOp(event.target.value as FilterOp)}
          aria-label={t("detail.filterOp")}
        >
          {OPS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
        {needsValue && (
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                add()
              }
            }}
            placeholder={t("detail.filterValue")}
            className="h-7 w-44 text-xs"
          />
        )}
        <Button variant="outline" size="xs" onClick={add} disabled={!canAdd}>
          <Plus />
          {t("detail.addFilter")}
        </Button>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((filter, index) => (
            <span
              key={`${filter.column}:${filter.op}:${filter.value}:${index}`}
              className="flex items-center gap-1 rounded-md border border-border bg-muted/40 py-0.5 pr-1 pl-2 font-mono text-[11px]"
            >
              <span className="text-foreground">{filter.column}</span>
              <span className="text-muted-foreground">
                {opLabel(filter.op)}
              </span>
              {opNeedsValue(filter.op) && (
                <span className="text-foreground">{filter.value}</span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={t("common.delete")}
                className="ml-0.5 rounded p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="ml-1 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("detail.clearFilters")}
          </button>
        </div>
      )}
    </div>
  )
}
