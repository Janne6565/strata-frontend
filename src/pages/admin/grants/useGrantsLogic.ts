import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { create2 as createGrantApi, revoke } from "@/api/generated/grants/grants"
import type { CreateGrantRequest } from "@/api/generated/model"
import { extractProblemDetail } from "@/lib/errors"
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const entry = useAppSelector((state) =>
    selectedUserId === "" ? undefined : state.grants.byUser[selectedUserId]
  )

  const selectUser = useCallback(
    (userId: string) => {
      setErrorMessage(null)
      setSelectedUserId(userId)
      if (userId !== "") {
        void dispatch(fetchGrants({ userId }))
      }
    },
    [dispatch]
  )

  const grants = entry?.items ?? []
  const status: LoadStatus | "empty" =
    selectedUserId === "" ? "empty" : entry ? deriveStatus(entry) : "loading"

  const createGrant = useCallback(
    async (request: CreateGrantRequest) => {
      setErrorMessage(null)
      try {
        dispatch(upsertGrant(await createGrantApi(request)))
        return true
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("grants.error.create"))
        return false
      }
    },
    [dispatch, t]
  )

  const revokeGrant = useCallback(
    async (id: string) => {
      setErrorMessage(null)
      try {
        await revoke(id)
        dispatch(removeGrant({ userId: selectedUserId, id }))
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("grants.error.revoke"))
      }
    },
    [dispatch, selectedUserId, t]
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
