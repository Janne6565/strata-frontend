import { useCallback, useEffect } from "react"

import { deriveStatus } from "@/store/cache"
import { fetchDatasources } from "@/store/datasourcesSlice"
import { fetchGroups } from "@/store/groupsSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchUsers } from "@/store/usersSlice"

// Each hook kicks a guarded fetch on mount (the thunk skips it when a request is
// in flight or the cache is still fresh), so navigating between screens reuses
// the cached list instead of refetching.

export function useDatasources() {
  const dispatch = useAppDispatch()
  const state = useAppSelector((s) => s.datasources)
  useEffect(() => {
    void dispatch(fetchDatasources())
  }, [dispatch])
  const refresh = useCallback(
    () => dispatch(fetchDatasources({ force: true })),
    [dispatch]
  )
  return { datasources: state.items, status: deriveStatus(state), refresh }
}

export function useGroups() {
  const dispatch = useAppDispatch()
  const state = useAppSelector((s) => s.groups)
  useEffect(() => {
    void dispatch(fetchGroups())
  }, [dispatch])
  const refresh = useCallback(
    () => dispatch(fetchGroups({ force: true })),
    [dispatch]
  )
  return { groups: state.items, status: deriveStatus(state), refresh }
}

export function useUsers() {
  const dispatch = useAppDispatch()
  const state = useAppSelector((s) => s.users)
  useEffect(() => {
    void dispatch(fetchUsers())
  }, [dispatch])
  const refresh = useCallback(
    () => dispatch(fetchUsers({ force: true })),
    [dispatch]
  )
  return { users: state.items, status: deriveStatus(state), refresh }
}
