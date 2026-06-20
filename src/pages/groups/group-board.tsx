import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse, GroupResponse } from "@/api/generated/model"
import { GroupZone, type Zone } from "@/pages/groups/group-zone"

export function GroupBoard({
  groups,
  datasources,
  onRename,
  onDelete,
  onMove,
  onRemoveMember,
}: {
  readonly groups: readonly GroupResponse[]
  readonly datasources: readonly DatasourceResponse[]
  readonly onRename: (id: string, name: string) => void
  readonly onDelete: (id: string) => void
  readonly onMove: (
    datasourceId: string,
    from: string | null,
    to: string | null
  ) => void
  readonly onRemoveMember: (groupId: string, datasourceId: string) => void
}) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState<{ id: string; from: string | null } | null>(
    null
  )
  const [overKey, setOverKey] = useState<string | null>(null)

  const zones = useMemo<Zone[]>(() => {
    const byId = new Map(datasources.map((d) => [d.id, d]))
    const assigned = new Set<string>()
    for (const group of groups) {
      for (const id of group.datasourceIds ?? []) {
        assigned.add(id)
      }
    }
    const unassigned = datasources.filter((d) => d.id && !assigned.has(d.id))

    const groupZones: Zone[] = groups.map((group) => ({
      key: group.id ?? "",
      id: group.id ?? null,
      name: group.name ?? "",
      editable: true,
      dbs: (group.datasourceIds ?? [])
        .map((id) => byId.get(id))
        .filter((d): d is DatasourceResponse => d !== undefined),
    }))

    return [
      {
        key: "unassigned",
        id: null,
        name: t("groups.unassigned"),
        editable: false,
        dbs: unassigned,
      },
      ...groupZones,
    ]
  }, [groups, datasources, t])

  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      {zones.map((zone) => (
        <GroupZone
          key={zone.key}
          zone={zone}
          isOver={overKey === zone.key && dragging !== null}
          draggingId={dragging?.id ?? null}
          onDragOver={(event) => {
            event.preventDefault()
            setOverKey(zone.key)
          }}
          onDrop={(event) => {
            event.preventDefault()
            if (dragging && dragging.from !== zone.id) {
              onMove(dragging.id, dragging.from, zone.id)
            }
            setDragging(null)
            setOverKey(null)
          }}
          onRename={onRename}
          onDelete={onDelete}
          onDbDragStart={(event, datasourceId, from) => {
            setDragging({ id: datasourceId, from })
            event.dataTransfer.effectAllowed = "move"
          }}
          onDbDragEnd={() => {
            setDragging(null)
            setOverKey(null)
          }}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </div>
  )
}
