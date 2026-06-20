import type { DragEvent } from "react"
import { GripVertical, Layers, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { engineStyle, engineTint } from "@/lib/engine"
import { cn } from "@/lib/utils"

function label(datasource: DatasourceResponse): string {
  return (
    datasource.displayName ??
    datasource.workloadName ??
    datasource.discoveryKey ??
    datasource.id ??
    "—"
  )
}

export function DbCard({
  datasource,
  dragging,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  readonly datasource: DatasourceResponse
  readonly dragging: boolean
  readonly onDragStart: (event: DragEvent) => void
  readonly onDragEnd: () => void
  readonly onRemove?: () => void
}) {
  const { t } = useTranslation()
  const present = datasource.status === "PRESENT"
  const statusColor = present ? "#3ecf8e" : "#e5a53b"

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "flex cursor-grab items-center gap-2.5 rounded-[11px] border border-white/[0.07] bg-[#0f1014] px-3 py-2.5 select-none active:cursor-grabbing",
        dragging && "opacity-40"
      )}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-[9px] border font-mono text-[11px] font-semibold"
        style={engineTint(datasource.driver)}
      >
        {engineStyle(datasource.driver).short}
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium">
          {label(datasource)}
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 truncate font-mono text-[11px]">
          <Layers className="size-3 shrink-0" />
          {datasource.namespace ?? "—"}
        </div>
      </div>

      <span
        className="flex shrink-0 items-center gap-1.5 text-[11.5px]"
        style={{ color: statusColor }}
      >
        <span
          className="size-[7px] rounded-full"
          style={{ background: statusColor }}
        />
        {present ? t("databases.healthy") : t("databases.status.missing")}
      </span>

      {onRemove && (
        <button
          type="button"
          aria-label={t("common.delete")}
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      )}

      <GripVertical className="size-4 shrink-0 cursor-grab text-[#4a4d55]" />
    </div>
  )
}
