import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { create2 as createGrantApi, revoke } from "@/api/generated/grants/grants"
import type { CreateGrantRequest } from "@/api/generated/model"
import { useDataInteractions } from "@/api/useDataInteractions"
import { deriveStatus, type LoadStatus } from "@/store/cache"
import { useDatasources, useUsers } from "@/store/entityHooks"
import { fetchGrants, removeGrant, upsertGrant } from "@/store/grantsSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/**
 * Drives the admin grants screen. Users + datasource pickers come from the
 * cached slices; grants are cached per user in the `grants` slice, so reselecting
 * a user shows their grants instantly without a refetch. Create/revoke upsert or
 * remove the grant in the store.
 */
export function useGrantsLogic() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { users } = useUsers()
  const { datasources } = useDatasources()

  const [selectedUserId, setSelectedUserId] = useState("")
  const { run, errorMessage, clearError } = useDataInteractions()
  const entry = useAppSelector((state) =>
    selectedUserId === "" ? undefined : state.grants.byUser[selectedUserId]
  )

  const selectUser = useCallback(
    (userId: string) => {
      clearError()
      setSelectedUserId(userId)
      if (userId !== "") {
        void dispatch(fetchGrants({ userId }))
      }
    },
    [dispatch, clearError]
  )

  const grants = entry?.items ?? []
  const status: LoadStatus | "empty" =
    selectedUserId === "" ? "empty" : entry ? deriveStatus(entry) : "loading"

  const createGrant = useCallback(
    (request: CreateGrantRequest) =>
      run(async () => {
        dispatch(upsertGrant(await createGrantApi(request)))
      }, t("grants.error.create")),
    [run, dispatch, t]
  )

  const revokeGrant = useCallback(
    (id: string) =>
      run(async () => {
        await revoke(id)
        dispatch(removeGrant({ userId: selectedUserId, id }))
      }, t("grants.error.revoke")),
    [run, dispatch, selectedUserId, t]
  )

  return {
    users,
    datasources,
    selectedUserId,
    selectUser,
    grants,
    status,
    errorMessage,
    createGrant,
    revokeGrant,
  }
}
