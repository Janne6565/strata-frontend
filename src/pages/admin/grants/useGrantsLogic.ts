import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { create2 as createGrantApi, listForUser, revoke } from "@/api/generated/grants/grants"
import { list2 as listDatasources } from "@/api/generated/inventory/inventory"
import { list as listUsers } from "@/api/generated/users/users"
import type { CreateGrantRequest, GrantResponse } from "@/api/generated/model"
import { useDataLoading } from "@/api/useDataLoading"
import { extractProblemDetail } from "@/lib/errors"

type GrantsStatus = "empty" | "loading" | "idle" | "failed"

/**
 * Drives the admin grants screen: pick a user, see their grants, create/revoke.
 * Grants for the selected user are fetched imperatively (the query depends on the
 * picked user), so there's no param-watching effect.
 */
export function useGrantsLogic() {
  const { t } = useTranslation()
  const { data: users } = useDataLoading(useCallback(() => listUsers(), []))
  const { data: datasources } = useDataLoading(
    useCallback(() => listDatasources(), [])
  )

  const [selectedUserId, setSelectedUserId] = useState("")
  const [grants, setGrants] = useState<GrantResponse[]>([])
  const [status, setStatus] = useState<GrantsStatus>("empty")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadGrants = useCallback(async (userId: string) => {
    if (userId === "") {
      setGrants([])
      setStatus("empty")
      return
    }
    setStatus("loading")
    try {
      setGrants(await listForUser({ userId }))
      setStatus("idle")
    } catch {
      setStatus("failed")
    }
  }, [])

  const selectUser = useCallback(
    (userId: string) => {
      setErrorMessage(null)
      setSelectedUserId(userId)
      void loadGrants(userId)
    },
    [loadGrants]
  )

  const createGrant = useCallback(
    async (request: CreateGrantRequest) => {
      setErrorMessage(null)
      try {
        await createGrantApi(request)
        await loadGrants(request.userId)
        return true
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("grants.error.create"))
        return false
      }
    },
    [loadGrants, t]
  )

  const revokeGrant = useCallback(
    async (id: string) => {
      setErrorMessage(null)
      try {
        await revoke(id)
        await loadGrants(selectedUserId)
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("grants.error.revoke"))
      }
    },
    [loadGrants, selectedUserId, t]
  )

  return {
    users: users ?? [],
    datasources: datasources ?? [],
    selectedUserId,
    selectUser,
    grants,
    status,
    errorMessage,
    createGrant,
    revokeGrant,
  }
}
