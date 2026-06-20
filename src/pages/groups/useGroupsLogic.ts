import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  addMember as addMemberApi,
  create1 as createGroup,
  _delete as deleteGroup,
  removeMember as removeMemberApi,
  rename as renameGroup,
  reorder as reorderGroups,
} from "@/api/generated/groups/groups"
import type { GroupResponse } from "@/api/generated/model"
import { useDataInteractions } from "@/api/useDataInteractions"
import { moveItem } from "@/lib/reorder"
import { useDatasources, useGroups } from "@/store/entityHooks"
import {
  fetchGroups,
  removeGroup,
  setGroups,
  upsertGroup,
} from "@/store/groupsSlice"
import { useAppDispatch } from "@/store/hooks"

function byPosition(groups: readonly GroupResponse[]): GroupResponse[] {
  return [...groups].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

/**
 * Manages groups against the cached `groups` slice: create / rename / delete and
 * membership upsert the affected group(s) back into the store (no full refetch),
 * so screens stay in sync without re-requesting the list.
 */
export function useGroupsLogic() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { groups: rawGroups, status } = useGroups()
  const { datasources } = useDatasources()
  const { run, errorMessage } = useDataInteractions()

  const groups = useMemo(() => byPosition(rawGroups), [rawGroups])

  const create = useCallback(
    (name: string) =>
      run(async () => {
        dispatch(upsertGroup(await createGroup({ name: name.trim() })))
      }, t("groups.error.create")),
    [run, dispatch, t]
  )

  const rename = useCallback(
    (id: string, name: string) =>
      run(async () => {
        dispatch(upsertGroup(await renameGroup(id, { name: name.trim() })))
      }, t("groups.error.rename")),
    [run, dispatch, t]
  )

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await deleteGroup(id)
        dispatch(removeGroup(id))
      }, t("groups.error.delete")),
    [run, dispatch, t]
  )

  const addMember = useCallback(
    (groupId: string, datasourceId: string) =>
      run(async () => {
        dispatch(upsertGroup(await addMemberApi(groupId, { datasourceId })))
      }, t("groups.error.member")),
    [run, dispatch, t]
  )

  const removeMember = useCallback(
    (groupId: string, datasourceId: string) =>
      run(async () => {
        dispatch(upsertGroup(await removeMemberApi(groupId, datasourceId)))
      }, t("groups.error.member")),
    [run, dispatch, t]
  )

  // Move a datasource between zones: upsert both affected groups (target via
  // addMember, source via removeMember). Null target/source = Unassigned.
  const moveMember = useCallback(
    (datasourceId: string, fromGroupId: string | null, toGroupId: string | null) =>
      run(async () => {
        if (toGroupId !== null) {
          dispatch(upsertGroup(await addMemberApi(toGroupId, { datasourceId })))
        }
        if (fromGroupId !== null && fromGroupId !== toGroupId) {
          dispatch(upsertGroup(await removeMemberApi(fromGroupId, datasourceId)))
        }
      }, t("groups.error.member")),
    [run, dispatch, t]
  )

  const reorder = useCallback(
    async (from: number, to: number) => {
      // Optimistic: reindex positions so the cached order survives re-sorting.
      const next = moveItem(groups, from, to).map((group, index) => ({
        ...group,
        position: index,
      }))
      dispatch(setGroups(next))
      const ok = await run(async () => {
        await reorderGroups({
          groupIds: next
            .map((group) => group.id)
            .filter((id): id is string => id !== undefined),
        })
      }, t("groups.error.reorder"))
      if (!ok) {
        void dispatch(fetchGroups({ force: true })) // revert to the server order
      }
    },
    [groups, dispatch, run, t]
  )

  return {
    groups,
    datasources,
    status,
    errorMessage,
    create,
    rename,
    remove,
    reorder,
    addMember,
    removeMember,
    moveMember,
  }
}
