import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { engineStyle } from "@/lib/engine"
import { cn } from "@/lib/utils"

export function EngineChips({
  datasources,
  selected,
  onSelect,
}: {
  readonly datasources: readonly DatasourceResponse[]
  readonly selected: string | null
  readonly onSelect: (driver: string | null) => void
}) {
  const { t } = useTranslation()

  const drivers = useMemo(() => {
    const counts = new Map<string, number>()
    for (const datasource of datasources) {
      const driver = datasource.driver ?? "unknown"
      counts.set(driver, (counts.get(driver) ?? 0) + 1)
    }
    return [...counts.entries()].map(([driver, count]) => ({ driver, count }))
  }, [datasources])

  if (drivers.length === 0) {
    return null
  }

  const chip = "flex h-[30px] items-center gap-2 rounded-lg border px-2.5 text-[12.5px] font-medium"

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          chip,
          selected === null
            ? "border-primary/40 bg-primary/15 text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground"
        )}
      >
        {t("databases.all")}
        <span className="font-mono text-[11px] opacity-70">
          {datasources.length}
        </span>
      </button>

      {drivers.map(({ driver, count }) => {
        const { color } = engineStyle(driver)
        const active = selected === driver
        return (
          <button
            key={driver}
            type="button"
            onClick={() => onSelect(active ? null : driver)}
            style={
              active
                ? { borderColor: `${color}55`, background: `${color}1f`, color }
                : undefined
            }
            className={cn(
              chip,
              !active &&
                "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className="size-2 rounded-[2px]"
              style={{ background: color }}
            />
            {driver}
            <span className="text-muted-foreground font-mono text-[11px]">
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
