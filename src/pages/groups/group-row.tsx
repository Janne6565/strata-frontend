import { useState } from "react"
import type { DragEvent } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse, GroupResponse } from "@/api/generated/model"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { engineStyle, engineTint } from "@/lib/engine"
import { cn } from "@/lib/utils"

function dsLabel(datasource: DatasourceResponse): string {
  return datasource.displayName ?? datasource.workloadName ?? datasource.id ?? "—"
}

export function GroupRow({
  group,
  index,
  datasources,
  isDragging,
  isDragOver,
  onGripDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  onRename,
  onDelete,
  onAddMember,
  onRemoveMember,
}: {
  readonly group: GroupResponse
  readonly index: number
  readonly datasources: readonly DatasourceResponse[]
  readonly isDragging: boolean
  readonly isDragOver: boolean
  readonly onGripDragStart: (index: number, event: DragEvent) => void
  readonly onRowDragOver: (index: number, event: DragEvent) => void
  readonly onRowDrop: (index: number, event: DragEvent) => void
  readonly onRowDragEnd: () => void
  readonly onRename: (id: string, name: string) => void
  readonly onDelete: (id: string) => void
  readonly onAddMember: (groupId: string, datasourceId: string) => void
  readonly onRemoveMember: (groupId: string, datasourceId: string) => void
}) {
  const { t } = useTranslation()
  const id = group.id ?? ""
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [pendingDelete, setPendingDelete] = useState(false)

  const memberIds = group.datasourceIds ?? []
  const members = memberIds.map(
    (mid) => datasources.find((d) => d.id === mid) ?? { id: mid }
  )
  const addable = datasources.filter((d) => d.id && !memberIds.includes(d.id))

  const saveEdit = () => {
    if (editValue.trim() !== "") {
      onRename(id, editValue)
    }
    setEditing(false)
  }

  return (
    <li
      onDragOver={(event) => onRowDragOver(index, event)}
      onDrop={(event) => onRowDrop(index, event)}
      onDragEnd={onRowDragEnd}
      className={cn(
        "flex flex-col",
        isDragOver && "bg-primary/10",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span
          draggable
          onDragStart={(event) => onGripDragStart(index, event)}
          aria-label={t("groups.reorderLabel")}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="text-muted-foreground size-4 shrink-0" />
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("groups.toggleMembers")}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </Button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <Input
              value={editValue}
              autoFocus
              className="h-7 max-w-xs"
              onChange={(event) => setEditValue(event.target.value)}
              onBlur={saveEdit}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveEdit()
                if (event.key === "Escape") setEditing(false)
              }}
            />
          ) : (
            <span className="truncate font-medium">{group.name}</span>
          )}
        </div>

        <Badge variant="outline">
          {t("groups.memberCount", { count: memberIds.length })}
        </Badge>

        {editing ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("common.confirm")}
            onClick={saveEdit}
          >
            <Check />
          </Button>
        ) : pendingDelete ? (
          <span className="inline-flex items-center gap-1">
            <Button
              variant="destructive"
              size="xs"
              onClick={() => {
                onDelete(id)
                setPendingDelete(false)
              }}
            >
              {t("common.confirm")}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("common.cancel")}
              onClick={() => setPendingDelete(false)}
            >
              <X />
            </Button>
          </span>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("groups.rename")}
              onClick={() => {
                setEditValue(group.name ?? "")
                setEditing(true)
              }}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("common.delete")}
              onClick={() => setPendingDelete(true)}
            >
              <Trash2 />
            </Button>
          </>
        )}
      </div>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-3 py-2.5 pl-10">
          {members.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("groups.noMembers")}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded border font-mono text-[8px] font-semibold"
                    style={engineTint(member.driver)}
                  >
                    {engineStyle(member.driver).short}
                  </span>
                  <span className="max-w-40 truncate">{dsLabel(member)}</span>
                  <button
                    type="button"
                    aria-label={t("common.delete")}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => member.id && onRemoveMember(id, member.id)}
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {addable.length > 0 && (
            <NativeSelect
              value=""
              className="h-7 max-w-xs text-xs"
              onChange={(event) => {
                if (event.target.value !== "") {
                  onAddMember(id, event.target.value)
                }
              }}
            >
              <option value="">{t("groups.addDatabase")}</option>
              {addable.map((datasource) => (
                <option key={datasource.id} value={datasource.id}>
                  {dsLabel(datasource)}
                </option>
              ))}
            </NativeSelect>
          )}
        </div>
      )}
    </li>
  )
}
