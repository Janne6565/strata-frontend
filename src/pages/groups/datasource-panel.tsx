import { Database } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"

export const DATASOURCE_DND_TYPE = "application/x-datasource-id"

function label(datasource: DatasourceResponse): string {
  return (
    datasource.displayName ??
    datasource.workloadName ??
    datasource.discoveryKey ??
    datasource.id ??
    "—"
  )
}

/** Catalog of datasources as draggable chips — drop one onto a group to add it. */
export function DatasourcePanel({
  datasources,
}: {
  readonly datasources: readonly DatasourceResponse[]
}) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-sm font-medium">{t("groups.panelTitle")}</h2>
        <p className="text-muted-foreground text-xs">{t("groups.panelHint")}</p>
      </div>
      {datasources.length === 0 ? (
        <p className="text-muted-foreground p-3 text-sm">
          {t("groups.panelEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1 p-2">
          {datasources.map((datasource) => (
            <li
              key={datasource.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  DATASOURCE_DND_TYPE,
                  datasource.id ?? ""
                )
                event.dataTransfer.effectAllowed = "copy"
              }}
              className="flex cursor-grab items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm active:cursor-grabbing"
            >
              <Database className="text-muted-foreground size-3.5 shrink-0" />
              <span className="truncate">{label(datasource)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
