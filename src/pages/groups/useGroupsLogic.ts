import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  create1 as createGroup,
  _delete as deleteGroup,
  list1 as listGroups,
  rename as renameGroup,
  reorder as reorderGroups,
} from "@/api/generated/groups/groups"
import type { GroupResponse } from "@/api/generated/model"
import { useDataLoading } from "@/api/useDataLoading"
import { extractProblemDetail } from "@/lib/errors"
import { moveItem } from "@/lib/reorder"

function byPosition(groups: readonly GroupResponse[]): GroupResponse[] {
  return [...groups].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

/**
 * Lists the caller's groups and manages create / rename / delete / reorder.
 * Reorder is applied optimistically via a local order override, then persisted;
 * a failure (or any other mutation) clears the override and reloads from server.
 */
export function useGroupsLogic() {
  const { t } = useTranslation()
  const loader = useCallback(() => listGroups(), [])
  const { data, status, reload } = useDataLoading(loader)
  const [override, setOverride] = useState<GroupResponse[] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Derived during render: the optimistic order if a reorder is pending,
  // otherwise the server order. No state-syncing effect needed.
  const groups = useMemo(
    () => override ?? byPosition(data ?? []),
    [override, data]
  )

  const guard = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      setErrorMessage(null)
      try {
        await action()
        setOverride(null) // fall back to fresh server order
        reload()
        return true
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? fallback)
        return false
      }
    },
    [reload]
  )

  const create = useCallback(
    (name: string) =>
      guard(() => createGroup({ name: name.trim() }), t("groups.error.create")),
    [guard, t]
  )

  const rename = useCallback(
    (id: string, name: string) =>
      guard(() => renameGroup(id, { name: name.trim() }), t("groups.error.rename")),
    [guard, t]
  )

  const remove = useCallback(
    (id: string) => guard(() => deleteGroup(id), t("groups.error.delete")),
    [guard, t]
  )

  const reorder = useCallback(
    async (from: number, to: number) => {
      const next = moveItem(groups, from, to)
      setOverride(next) // optimistic
      setErrorMessage(null)
      try {
        await reorderGroups({
          groupIds: next.map((group) => group.id).filter((id) => id !== undefined),
        })
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("groups.error.reorder"))
        setOverride(null)
        reload() // revert to the server's order
      }
    },
    [groups, reload, t]
  )

  return {
    groups,
    status,
    errorMessage,
    create,
    rename,
    remove,
    reorder,
  }
}
