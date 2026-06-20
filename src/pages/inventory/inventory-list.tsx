import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronRight, Layers } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse, GroupResponse } from "@/api/generated/model"
import { useDatabaseMetrics } from "@/api/useDatabaseMetrics"
import { engineStyle, engineTint } from "@/lib/engine"
import {
  formatBytes,
  formatCount,
  formatPercent,
  formatPods,
  meterColor,
} from "@/lib/metrics"

const COLS =
  "grid-cols-[2.1fr_1fr_0.8fr_1.1fr_1.1fr_1.1fr_1fr_28px] gap-3"

function name(datasource: DatasourceResponse): string {
  return (
    datasource.displayName ??
    datasource.workloadName ??
    datasource.discoveryKey ??
    datasource.id ??
    "—"
  )
}

function isProd(name: string): boolean {
  return /prod/i.test(name)
}

/** A utilization bar + label, or a muted em dash when the metric is unavailable. */
function Meter({ pct }: { readonly pct: number | null | undefined }) {
  if (pct == null) {
    return <div className="text-muted-foreground/50 font-mono text-[12px]">—</div>
  }
  return (
    <div>
      <div className="h-1 overflow-hidden rounded-[3px] bg-white/[0.07]">
        <span
          className="block h-full"
          style={{ width: `${Math.min(100, pct)}%`, background: meterColor(pct) }}
        />
      </div>
      <div className="text-muted-foreground mt-1 font-mono text-[10.5px]">
        {formatPercent(pct)}
      </div>
    </div>
  )
}

export function InventoryList({
  datasources,
  groups,
}: {
  readonly datasources: readonly DatasourceResponse[]
  readonly groups: readonly GroupResponse[]
}) {
  const { t } = useTranslation()

  // Poll live resource metrics for every visible database in one batched request.
  const ids = useMemo(
    () => datasources.map((datasource) => datasource.id ?? "").filter(Boolean),
    [datasources]
  )
  const { metrics } = useDatabaseMetrics(ids)

  // Group databases by the group they belong to (from the groups API), not by
  // their cluster namespace. Databases that aren't in any group fall into a
  // trailing "Unassigned" section. Empty groups are hidden.
  const sections = useMemo(() => {
    const byId = new Map(datasources.map((datasource) => [datasource.id, datasource]))
    const assigned = new Set<string>()

    const groupSections = groups.map((group) => {
      const dbs: DatasourceResponse[] = []
      for (const id of group.datasourceIds ?? []) {
        const datasource = byId.get(id)
        if (datasource) {
          dbs.push(datasource)
          assigned.add(id)
        }
      }
      return { key: group.id ?? "", name: group.name ?? "—", dbs }
    })

    const unassigned = datasources.filter(
      (datasource) => !(datasource.id && assigned.has(datasource.id))
    )

    const visible = groupSections.filter((section) => section.dbs.length > 0)
    if (unassigned.length > 0) {
      visible.push({
        key: "__unassigned",
        name: t("groups.unassigned"),
        dbs: unassigned,
      })
    }
    return visible
  }, [datasources, groups, t])

  return (
    <div className="flex flex-col gap-6">
      {sections.map((group) => (
        <div key={group.key}>
          <div className="mb-2.5 flex items-center gap-2 pl-0.5">
            <Layers className="text-muted-foreground size-3.5" />
            <span className="font-mono text-[12.5px] font-medium text-[#c4c7cd]">
              {group.name}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {t("databases.nsCount", { count: group.dbs.length })}
            </span>
            {isProd(group.name) && (
              <span className="rounded-[5px] border border-warning/25 bg-warning/10 px-1.5 py-px text-[10px] font-semibold tracking-wide text-warning">
                {t("databases.prod")}
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div
              className={`text-muted-foreground grid ${COLS} border-b border-border/60 px-4 py-2 text-[10.5px] font-semibold tracking-wide uppercase`}
            >
              <div>{t("databases.col.name")}</div>
              <div>{t("databases.col.status")}</div>
              <div>{t("databases.col.pods")}</div>
              <div>{t("databases.col.cpu")}</div>
              <div>{t("databases.col.memory")}</div>
              <div>{t("databases.col.size")}</div>
              <div>{t("databases.col.conns")}</div>
              <div />
            </div>

            {group.dbs.map((datasource) => {
              const engine = engineStyle(datasource.driver)
              const m = datasource.id ? metrics.get(datasource.id) : undefined
              const present = datasource.status === "PRESENT"
              const statusColor = present ? "#3ecf8e" : "#e5a53b"
              return (
                <Link
                  key={datasource.id ?? datasource.discoveryKey}
                  to="/databases/$id"
                  params={{ id: datasource.id ?? "" }}
                  className={`grid ${COLS} items-center border-b border-border/40 px-4 py-3 last:border-0 hover:bg-white/[0.025]`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex size-[30px] shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold"
                      style={engineTint(datasource.driver)}
                    >
                      {engine.short}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-foreground">
                        {name(datasource)}
                      </div>
                      <div className="text-muted-foreground truncate font-mono text-[11px]">
                        {datasource.driver ?? "—"}
                        {datasource.engineVersion ? ` ${datasource.engineVersion}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-[7px] rounded-full"
                      style={{ background: statusColor }}
                    />
                    <span className="text-[12px]" style={{ color: statusColor }}>
                      {present ? t("databases.healthy") : t("databases.status.missing")}
                    </span>
                  </div>

                  <div className="font-mono text-[12px] text-[#9a9ea6]">
                    {formatPods(m?.podsReady, m?.podsDesired)}
                  </div>
                  <Meter pct={m?.cpuPercent} />
                  <Meter pct={m?.memoryPercent} />
                  <div className="font-mono text-[12px] text-[#9a9ea6]">
                    {formatBytes(m?.dataSizeBytes)}
                  </div>
                  <div className="font-mono text-[12px] text-[#9a9ea6]">
                    {formatCount(m?.connections)}
                  </div>
                  <div className="text-muted-foreground/60 flex justify-end">
                    <ChevronRight className="size-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
