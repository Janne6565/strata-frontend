import { Cpu, Database, HardDrive, Plug } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { meterColor, mockMetrics } from "@/lib/mock-metrics"

function StatCard({
  icon,
  label,
  value,
  children,
}: {
  readonly icon: ReactNode
  readonly label: string
  readonly value: string
  readonly children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[11.5px] font-medium">
        {icon}
        {label}
      </div>
      <div className="my-2.5 font-mono text-[22px] font-semibold">{value}</div>
      {children}
    </div>
  )
}

function Bar({ pct }: { readonly pct: number }) {
  return (
    <div className="h-1 overflow-hidden rounded-[3px] bg-white/[0.07]">
      <span
        className="block h-full"
        style={{ width: `${Math.min(100, pct)}%`, background: meterColor(pct) }}
      />
    </div>
  )
}

export function OverviewTab({
  datasource,
}: {
  readonly datasource?: DatasourceResponse
}) {
  const { t } = useTranslation()
  const m = mockMetrics(datasource?.id ?? "")
  const connPct = Math.min(100, m.conns * 1.6)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard
          icon={<Plug className="size-3.5" />}
          label={t("detail.stat.conns")}
          value={String(m.conns)}
        >
          <Bar pct={connPct} />
        </StatCard>
        <StatCard
          icon={<HardDrive className="size-3.5" />}
          label={t("detail.stat.storage")}
          value={`${m.storagePct}%`}
        >
          <Bar pct={m.storagePct} />
        </StatCard>
        <StatCard
          icon={<Database className="size-3.5" />}
          label={t("detail.stat.dataSize")}
          value={m.dataSize}
        >
          <div className="text-muted-foreground font-mono text-[11.5px]">
            {t("detail.stat.objects", { count: m.objects })}
          </div>
        </StatCard>
        <StatCard
          icon={<Cpu className="size-3.5" />}
          label={t("detail.stat.cpu")}
          value={`${m.cpuPct}%`}
        >
          <Bar pct={m.cpuPct} />
        </StatCard>
      </div>
      <p className="text-muted-foreground/70 text-xs">
        {t("detail.metricsNote")}
      </p>
    </div>
  )
}
