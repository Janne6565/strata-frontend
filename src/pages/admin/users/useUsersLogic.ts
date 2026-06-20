import { useCallback } from "react"
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
import { useDataInteractions } from "@/api/useDataInteractions"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { useUsers } from "@/store/entityHooks"
import { useAppDispatch } from "@/store/hooks"
import { removeUser as removeUserFromStore, upsertUser } from "@/store/usersSlice"

/**
 * Lists users from the cached `users` slice and exposes create / change-role /
 * delete. Each mutation upserts/removes the returned user in the store (no
 * refetch) through the shared `useDataInteractions` seam, which surfaces backend
 * invariant messages (last OWNER, duplicate username, no self-delete) verbatim.
 */
export function useUsersLogic() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAuthInformation()
  const { users, status } = useUsers()
  const { run, errorMessage, clearError } = useDataInteractions()

  const createUser = useCallback(
    (request: CreateUserRequest) =>
      run(async () => {
        dispatch(upsertUser(await createUserApi(request)))
      }, t("users.error.create")),
    [run, dispatch, t]
  )

  const changeRole = useCallback(
    (id: string, role: ChangeRoleRequestRole) =>
      run(async () => {
        dispatch(upsertUser(await changeUserRole(id, { role })))
      }, t("users.error.changeRole")),
    [run, dispatch, t]
  )

  const removeUser = useCallback(
    (id: string) =>
      run(async () => {
        await deleteUserApi(id)
        dispatch(removeUserFromStore(id))
      }, t("users.error.delete")),
    [run, dispatch, t]
  )

  return {
    users,
    status,
    createUser,
    changeRole,
    removeUser,
    errorMessage,
    clearError,
    currentUserId: currentUser?.id ?? null,
  }
}
