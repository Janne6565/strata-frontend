import { RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { DatasourceTable } from "@/pages/inventory/datasource-table"
import { useInventoryLogic } from "@/pages/inventory/useInventoryLogic"
import { cn } from "@/lib/utils"

export function InventoryPage() {
  const { t } = useTranslation()
  const {
    datasources,
    status,
    reload,
    isAdmin,
    rescan,
    isRescanning,
    isFiltered,
    total,
  } = useInventoryLogic()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("databases.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("databases.subtitle", { count: total })}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={rescan}
            disabled={isRescanning}
          >
            <RefreshCw className={cn("size-4", isRescanning && "animate-spin")} />
            {isRescanning ? t("databases.rescanning") : t("databases.rescan")}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {status === "loading" && (
          <p className="text-muted-foreground p-8 text-center text-sm">
            {t("common.loading")}
          </p>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-destructive text-sm">{t("databases.error")}</p>
            <Button variant="outline" size="sm" onClick={reload}>
              {t("common.retry")}
            </Button>
          </div>
        )}

        {status === "idle" && datasources.length === 0 && (
          <p className="text-muted-foreground p-8 text-center text-sm">
            {isFiltered ? t("databases.empty.filtered") : t("databases.empty.none")}
          </p>
        )}

        {status === "idle" && datasources.length > 0 && (
          <DatasourceTable datasources={datasources} />
        )}
      </div>
    </div>
  )
}
