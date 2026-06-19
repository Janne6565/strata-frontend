import { useState } from "react"
import type { DragEvent } from "react"

import type { DatasourceResponse, GroupResponse } from "@/api/generated/model"
import { DATASOURCE_DND_TYPE } from "@/pages/groups/datasource-panel"
import { GroupRow } from "@/pages/groups/group-row"

const GROUP_DND_TYPE = "application/x-group-index"

/**
 * Renders the groups and arbitrates two native drag interactions on each row:
 * a dragged datasource chip (adds it to the group) or a dragged group (reorders).
 */
export function GroupList({
  groups,
  datasources,
  onRename,
  onDelete,
  onReorder,
  onAddMember,
  onRemoveMember,
}: {
  readonly groups: readonly GroupResponse[]
  readonly datasources: readonly DatasourceResponse[]
  readonly onRename: (id: string, name: string) => void
  readonly onDelete: (id: string) => void
  readonly onReorder: (from: number, to: number) => void
  readonly onAddMember: (groupId: string, datasourceId: string) => void
  readonly onRemoveMember: (groupId: string, datasourceId: string) => void
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDrop = (targetIndex: number, event: DragEvent) => {
    event.preventDefault()
    const datasourceId = event.dataTransfer.getData(DATASOURCE_DND_TYPE)
    if (datasourceId !== "") {
      const groupId = groups[targetIndex]?.id
      if (groupId) {
        onAddMember(groupId, datasourceId)
      }
    } else if (dragIndex !== null && dragIndex !== targetIndex) {
      onReorder(dragIndex, targetIndex)
    }
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ul className="divide-y divide-border">
      {groups.map((group, index) => (
        <GroupRow
          key={group.id}
          group={group}
          index={index}
          datasources={datasources}
          isDragging={dragIndex === index}
          isDragOver={overIndex === index}
          onGripDragStart={(i, event) => {
            setDragIndex(i)
            event.dataTransfer.setData(GROUP_DND_TYPE, String(i))
            event.dataTransfer.effectAllowed = "move"
          }}
          onRowDragOver={(i, event) => {
            event.preventDefault()
            setOverIndex(i)
          }}
          onRowDrop={handleDrop}
          onRowDragEnd={() => {
            setDragIndex(null)
            setOverIndex(null)
          }}
          onRename={onRename}
          onDelete={onDelete}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </ul>
  )
}
