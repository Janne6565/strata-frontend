import { useState } from "react"
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { GroupResponse } from "@/api/generated/model"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function GroupList({
  groups,
  onRename,
  onDelete,
  onReorder,
}: {
  readonly groups: readonly GroupResponse[]
  readonly onRename: (id: string, name: string) => void
  readonly onDelete: (id: string) => void
  readonly onReorder: (from: number, to: number) => void
}) {
  const { t } = useTranslation()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const saveEdit = (id: string) => {
    if (editValue.trim() !== "") {
      onRename(id, editValue)
    }
    setEditingId(null)
  }

  return (
    <ul className="divide-y divide-border">
      {groups.map((group, index) => {
        const id = group.id ?? ""
        return (
          <li
            key={id}
            draggable={editingId === null}
            onDragStart={(event) => {
              setDragIndex(index)
              event.dataTransfer.effectAllowed = "move"
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setOverIndex(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index)
              }
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5",
              dragIndex !== null && overIndex === index && "bg-muted/50",
              dragIndex === index && "opacity-50"
            )}
          >
            <GripVertical className="text-muted-foreground size-4 shrink-0 cursor-grab" />

            <div className="min-w-0 flex-1">
              {editingId === id ? (
                <Input
                  value={editValue}
                  autoFocus
                  className="h-7 max-w-xs"
                  onChange={(event) => setEditValue(event.target.value)}
                  onBlur={() => saveEdit(id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveEdit(id)
                    if (event.key === "Escape") setEditingId(null)
                  }}
                />
              ) : (
                <span className="truncate font-medium">{group.name}</span>
              )}
            </div>

            <Badge variant="outline">
              {t("groups.memberCount", {
                count: group.datasourceIds?.length ?? 0,
              })}
            </Badge>

            {editingId === id ? (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={t("common.confirm")}
                onClick={() => saveEdit(id)}
              >
                <Check />
              </Button>
            ) : pendingDelete === id ? (
              <span className="inline-flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => {
                    onDelete(id)
                    setPendingDelete(null)
                  }}
                >
                  {t("common.confirm")}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={t("common.cancel")}
                  onClick={() => setPendingDelete(null)}
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
                    setEditingId(id)
                    setEditValue(group.name ?? "")
                  }}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={t("common.delete")}
                  onClick={() => setPendingDelete(id)}
                >
                  <Trash2 />
                </Button>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
