import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { engineStyle, engineTint } from "@/lib/engine"

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
              className="flex cursor-grab items-center gap-2.5 rounded-[11px] border border-border bg-[#0f1014] px-2.5 py-2 active:cursor-grabbing hover:bg-white/[0.025]"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-semibold"
                style={engineTint(datasource.driver)}
              >
                {engineStyle(datasource.driver).short}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium">
                  {label(datasource)}
                </div>
                <div className="text-muted-foreground truncate font-mono text-[10.5px]">
                  {datasource.driver ?? "db"}
                  {datasource.namespace ? ` · ${datasource.namespace}` : ""}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
