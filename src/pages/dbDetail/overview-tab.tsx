import { Cpu, Database, MemoryStick, Plug } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { useDatabaseMetrics } from "@/api/useDatabaseMetrics"
import {
  formatBytes,
  formatCount,
  formatPercent,
  meterColor,
} from "@/lib/metrics"

function StatCard({
  icon,
  label,
  value,
  valueTitle,
  children,
}: {
  readonly icon: ReactNode
  readonly label: string
  readonly value: string
  readonly valueTitle?: string
  readonly children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[11.5px] font-medium">
        {icon}
        {label}
      </div>
      <div className="my-2.5 font-mono text-[22px] font-semibold" title={valueTitle}>
        {value}
      </div>
      {children}
    </div>
  )
}

/** A utilization bar; renders an empty track when the metric is unavailable. */
function Bar({ pct }: { readonly pct: number | null | undefined }) {
  return (
    <div className="h-1 overflow-hidden rounded-[3px] bg-white/[0.07]">
      {pct != null && (
        <span
          className="block h-full"
          style={{ width: `${Math.min(100, pct)}%`, background: meterColor(pct) }}
        />
      )}
    </div>
  )
}

export function OverviewTab({
  datasource,
}: {
  readonly datasource?: DatasourceResponse
}) {
  const { t } = useTranslation()
  const { metrics } = useDatabaseMetrics(datasource?.id ? [datasource.id] : [])
  const m = datasource?.id ? metrics.get(datasource.id) : undefined
  const connPct = m?.connections == null ? null : Math.min(100, m.connections * 1.6)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard
          icon={<Plug className="size-3.5" />}
          label={t("detail.stat.conns")}
          value={formatCount(m?.connections)}
        >
          <Bar pct={connPct} />
        </StatCard>
        <StatCard
          icon={<MemoryStick className="size-3.5" />}
          label={t("detail.stat.memory")}
          value={formatPercent(m?.memoryPercent)}
        >
          <Bar pct={m?.memoryPercent} />
        </StatCard>
        <StatCard
          icon={<Database className="size-3.5" />}
          label={t("detail.stat.dataSize")}
          value={formatBytes(m?.dataSizeBytes)}
          valueTitle={
            m != null && m.dataSizeBytes == null
              ? t("common.dataSizeUnavailable", {
                  driver: datasource?.driver ?? "these",
                })
              : undefined
          }
        >
          <div className="text-muted-foreground font-mono text-[11.5px]">
            {m?.objectCount == null
              ? "—"
              : t("detail.stat.objects", { count: m.objectCount })}
          </div>
        </StatCard>
        <StatCard
          icon={<Cpu className="size-3.5" />}
          label={t("detail.stat.cpu")}
          value={formatPercent(m?.cpuPercent)}
        >
          <Bar pct={m?.cpuPercent} />
        </StatCard>
      </div>
      <p className="text-muted-foreground/70 text-xs">{t("detail.metricsNote")}</p>
    </div>
  )
}
