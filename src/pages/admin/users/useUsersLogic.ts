import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  changeRole as changeUserRole,
  create as createUserApi,
  delete1 as deleteUserApi,
  list as listUsers,
} from "@/api/generated/users/users"
import type {
  ChangeRoleRequestRole,
  CreateUserRequest,
} from "@/api/generated/model"
import { useDataLoading } from "@/api/useDataLoading"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { extractProblemDetail } from "@/lib/errors"

/**
 * Lists users and exposes create / change-role / delete. Mutations call the API
 * directly (not the swallow-the-error seam) so backend invariant messages — last
 * OWNER, duplicate username, no self-delete — reach the UI verbatim.
 */
export function useUsersLogic() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuthInformation()
  const loader = useCallback(() => listUsers(), [])
  const { data, status, reload } = useDataLoading(loader)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const guard = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      setErrorMessage(null)
      try {
        await action()
        reload()
        return true
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? fallback)
        return false
      }
    },
    [reload]
  )

  const createUser = useCallback(
    (request: CreateUserRequest) =>
      guard(() => createUserApi(request), t("users.error.create")),
    [guard, t]
  )

  const changeRole = useCallback(
    (id: string, role: ChangeRoleRequestRole) =>
      guard(() => changeUserRole(id, { role }), t("users.error.changeRole")),
    [guard, t]
  )

  const removeUser = useCallback(
    (id: string) => guard(() => deleteUserApi(id), t("users.error.delete")),
    [guard, t]
  )

  return {
    users: data ?? [],
    status,
    reload,
    createUser,
    changeRole,
    removeUser,
    errorMessage,
    clearError: useCallback(() => setErrorMessage(null), []),
    currentUserId: currentUser?.id ?? null,
  }
}
