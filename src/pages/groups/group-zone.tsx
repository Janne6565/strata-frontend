import { useState } from "react"
import type { DragEvent } from "react"
import { Layers, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { DbCard } from "@/pages/groups/db-card"
import { cn } from "@/lib/utils"

export interface Zone {
  readonly key: string
  readonly id: string | null
  readonly name: string
  readonly editable: boolean
  readonly dbs: readonly DatasourceResponse[]
}

export function GroupZone({
  zone,
  isOver,
  draggingId,
  onDragOver,
  onDrop,
  onRename,
  onDelete,
  onDbDragStart,
  onDbDragEnd,
  onRemoveMember,
}: {
  readonly zone: Zone
  readonly isOver: boolean
  readonly draggingId: string | null
  readonly onDragOver: (event: DragEvent) => void
  readonly onDrop: (event: DragEvent) => void
  readonly onRename: (id: string, name: string) => void
  readonly onDelete: (id: string) => void
  readonly onDbDragStart: (
    event: DragEvent,
    datasourceId: string,
    from: string | null
  ) => void
  readonly onDbDragEnd: () => void
  readonly onRemoveMember: (groupId: string, datasourceId: string) => void
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(zone.name)

  const commit = () => {
    if (zone.id !== null && draft.trim() !== "" && draft !== zone.name) {
      onRename(zone.id, draft)
    }
  }

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "rounded-[14px] border p-3.5 transition-colors",
        isOver
          ? "border-primary/50 bg-primary/[0.06]"
          : "border-border bg-[#0c0d11]"
      )}
    >
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <Layers className="text-muted-foreground size-4 shrink-0" />
        {zone.editable ? (
          <input
            value={draft}
            spellCheck={false}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") setDraft(zone.name)
            }}
            className="min-w-0 flex-1 border-b border-transparent bg-transparent py-0.5 text-[13px] font-medium text-[#d4d7dd] outline-none focus:border-primary/50"
          />
        ) : (
          <span className="flex-1 text-[13px] font-medium text-[#d4d7dd]">
            {zone.name}
          </span>
        )}
        <span className="text-muted-foreground shrink-0 text-[11.5px]">
          {zone.dbs.length}
        </span>
        {zone.id !== null && (
          <button
            type="button"
            aria-label={t("common.delete")}
            onClick={() => onDelete(zone.id as string)}
            className="text-muted-foreground hover:bg-destructive/12 hover:text-destructive flex size-6 shrink-0 items-center justify-center rounded-md"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {zone.dbs.map((datasource) => (
          <DbCard
            key={datasource.id}
            datasource={datasource}
            dragging={draggingId === datasource.id}
            onDragStart={(event) =>
              onDbDragStart(event, datasource.id ?? "", zone.id)
            }
            onDragEnd={onDbDragEnd}
            onRemove={
              zone.id !== null
                ? () => onRemoveMember(zone.id as string, datasource.id ?? "")
                : undefined
            }
          />
        ))}
        {zone.dbs.length === 0 && (
          <div className="text-muted-foreground rounded-[11px] border-[1.5px] border-dashed border-white/10 p-5 text-center text-[12px]">
            {t("groups.dropHere")}
          </div>
        )}
      </div>
    </div>
  )
}
