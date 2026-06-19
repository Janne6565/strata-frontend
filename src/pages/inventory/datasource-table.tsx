import type { ParseKeys } from "i18next"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { Badge } from "@/components/ui/badge"

function statusBadge(status: DatasourceResponse["status"]): {
  variant: "success" | "warning"
  key: ParseKeys
} {
  if (status === "PRESENT") {
    return { variant: "success", key: "databases.status.present" }
  }
  return { variant: "warning", key: "databases.status.missing" }
}

function displayName(datasource: DatasourceResponse): string {
  return (
    datasource.displayName ??
    datasource.workloadName ??
    datasource.discoveryKey ??
    datasource.id ??
    "—"
  )
}

export function DatasourceTable({
  datasources,
}: {
  readonly datasources: readonly DatasourceResponse[]
}) {
  const { t } = useTranslation()

  return (
    <table className="w-full text-sm">
      <thead className="text-muted-foreground border-b border-border text-left">
        <tr>
          <th className="px-4 py-2 font-medium">{t("databases.col.name")}</th>
          <th className="px-4 py-2 font-medium">{t("databases.col.engine")}</th>
          <th className="px-4 py-2 font-medium">
            {t("databases.col.location")}
          </th>
          <th className="px-4 py-2 font-medium">{t("databases.col.status")}</th>
          <th className="px-4 py-2 font-medium">{t("databases.col.origin")}</th>
        </tr>
      </thead>
      <tbody>
        {datasources.map((datasource) => {
          const status = statusBadge(datasource.status)
          return (
            <tr
              key={datasource.id ?? datasource.discoveryKey}
              className="border-b border-border/60 last:border-0 hover:bg-muted/30"
            >
              <td className="px-4 py-2.5 font-medium">
                {displayName(datasource)}
              </td>
              <td className="text-muted-foreground px-4 py-2.5">
                {datasource.driver ?? "—"}
                {datasource.engineVersion ? ` · ${datasource.engineVersion}` : ""}
              </td>
              <td className="text-muted-foreground px-4 py-2.5">
                {datasource.namespace ?? "—"}
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={status.variant}>{t(status.key)}</Badge>
              </td>
              <td className="px-4 py-2.5">
                <Badge
                  variant={
                    datasource.origin === "MANUAL" ? "secondary" : "outline"
                  }
                >
                  {datasource.origin === "MANUAL"
                    ? t("databases.origin.manual")
                    : t("databases.origin.discovered")}
                </Badge>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
