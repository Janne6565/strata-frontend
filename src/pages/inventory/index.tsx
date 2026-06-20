import { RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { EngineChips } from "@/pages/inventory/EngineChips"
import { InventoryList } from "@/pages/inventory/InventoryList"
import { useInventoryLogic } from "@/pages/inventory/useInventoryLogic"
import { cn } from "@/lib/utils"

export function InventoryPage() {
  const { t } = useTranslation()
  const {
    datasources,
    shown,
    groups,
    groupCount,
    engine,
    setEngine,
    status,
    reload,
    isAdmin,
    rescan,
    isRescanning,
    isFiltered,
  } = useInventoryLogic()

  return (
    <div className="animate-fade-up mx-auto flex max-w-[1280px] flex-col gap-4 p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            {t("databases.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {t("databases.subtitle", { count: shown.length, groups: groupCount })}
            <span className="mx-1.5 opacity-40">·</span>
            <span className="opacity-70">{t("databases.metricsNote")}</span>
          </p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={rescan} disabled={isRescanning}>
            <RefreshCw className={cn("size-4", isRescanning && "animate-spin")} />
            {isRescanning ? t("databases.rescanning") : t("databases.rescan")}
          </Button>
        )}
      </div>

      {status === "idle" && datasources.length > 0 && (
        <EngineChips
          datasources={datasources}
          selected={engine}
          onSelect={setEngine}
        />
      )}

      {status === "loading" && (
        <p className="text-muted-foreground rounded-xl border border-border bg-card p-8 text-center text-sm">
          {t("common.loading")}
        </p>
      )}
      {status === "failed" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-destructive text-sm">{t("databases.error")}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            {t("common.retry")}
          </Button>
        </div>
      )}
      {status === "idle" && shown.length === 0 && (
        <p className="text-muted-foreground rounded-xl border border-border bg-card p-8 text-center text-sm">
          {isFiltered ? t("databases.empty.filtered") : t("databases.empty.none")}
        </p>
      )}
      {status === "idle" && shown.length > 0 && (
        <InventoryList datasources={shown} groups={groups} />
      )}
    </div>
  )
}
