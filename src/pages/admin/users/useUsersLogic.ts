import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  changeRole as changeUserRole,
  create as createUserApi,
  delete1 as deleteUserApi,
} from "@/api/generated/users/users"
import type {
  ChangeRoleRequestRole,
  CreateUserRequest,
} from "@/api/generated/model"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { extractProblemDetail } from "@/lib/errors"
import { useUsers } from "@/store/entityHooks"
import { useAppDispatch } from "@/store/hooks"
import { removeUser as removeUserFromStore, upsertUser } from "@/store/usersSlice"

/**
 * Lists users from the cached `users` slice and exposes create / change-role /
 * delete. Each mutation upserts/removes the returned user in the store (no
 * refetch), and surfaces backend invariant messages (last OWNER, duplicate
 * username, no self-delete) verbatim.
 */
export function useUsersLogic() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAuthInformation()
  const { users, status } = useUsers()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const guard = useCallback(
    async (action: () => Promise<void>, fallback: string): Promise<boolean> => {
      setErrorMessage(null)
      try {
        await action()
        return true
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? fallback)
        return false
      }
    },
    []
  )

  const createUser = useCallback(
    (request: CreateUserRequest) =>
      guard(async () => {
        dispatch(upsertUser(await createUserApi(request)))
      }, t("users.error.create")),
    [guard, dispatch, t]
  )

  const changeRole = useCallback(
    (id: string, role: ChangeRoleRequestRole) =>
      guard(async () => {
        dispatch(upsertUser(await changeUserRole(id, { role })))
      }, t("users.error.changeRole")),
    [guard, dispatch, t]
  )

  const removeUser = useCallback(
    (id: string) =>
      guard(async () => {
        await deleteUserApi(id)
        dispatch(removeUserFromStore(id))
      }, t("users.error.delete")),
    [guard, dispatch, t]
  )

  return {
    users,
    status,
    createUser,
    changeRole,
    removeUser,
    errorMessage,
    clearError: useCallback(() => setErrorMessage(null), []),
    currentUserId: currentUser?.id ?? null,
  }
}
