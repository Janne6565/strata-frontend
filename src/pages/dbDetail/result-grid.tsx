import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

function renderCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL"
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}

/** Shared columns/rows grid for both the table browser and the query console. */
export function ResultGrid({
  columns,
  rows,
}: {
  readonly columns?: readonly string[]
  readonly rows?: readonly unknown[][]
}) {
  const { t } = useTranslation()
  const cols = columns ?? []
  const data = rows ?? []

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-center text-sm">
        {t("detail.noRows")}
      </p>
    )
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-left font-mono text-xs">
        <thead className="text-muted-foreground sticky top-0 bg-card">
          <tr className="border-b border-border">
            {cols.map((col) => (
              <th key={col} className="px-3 py-2 font-medium whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border/50 last:border-0 hover:bg-muted/30"
            >
              {row.map((cell, cellIndex) => {
                const isNull = cell === null || cell === undefined
                return (
                  <td
                    key={cellIndex}
                    className={cn(
                      "max-w-xs truncate px-3 py-1.5",
                      isNull && "text-muted-foreground/60 italic"
                    )}
                    title={renderCell(cell)}
                  >
                    {renderCell(cell)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
