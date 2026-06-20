import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { listForUser } from "@/api/generated/grants/grants"
import type { GrantResponse } from "@/api/generated/model"
import { isFresh } from "@/store/cache"
import type { RootState } from "@/store/store"

interface UserGrants {
  items: GrantResponse[]
  loading: boolean
  loaded: boolean
  loadedAt: number | null
  error: string | null
}

// Grants are scoped to a user, so the cache is keyed by userId.
interface GrantsState {
  byUser: Record<string, UserGrants>
}

const initialState: GrantsState = { byUser: {} }

const emptyUserGrants: UserGrants = {
  items: [],
  loading: false,
  loaded: false,
  loadedAt: null,
  error: null,
}

export const fetchGrants = createAsyncThunk<
  GrantResponse[],
  { userId: string; force?: boolean },
  { state: RootState }
>("grants/fetch", (arg) => listForUser({ userId: arg.userId }), {
  condition: (arg, { getState }) => {
    const entry = getState().grants.byUser[arg.userId] ?? emptyUserGrants
    return !isFresh(entry, arg.force)
  },
})

function entry(state: GrantsState, userId: string): UserGrants {
  if (!state.byUser[userId]) {
    state.byUser[userId] = { ...emptyUserGrants }
  }
  return state.byUser[userId]
}

const slice = createSlice({
  name: "grants",
  initialState,
  reducers: {
    upsertGrant(state, action: PayloadAction<GrantResponse>) {
      const userId = action.payload.userId
      if (!userId) {
        return
      }
      const e = entry(state, userId)
      const index = e.items.findIndex((g) => g.id === action.payload.id)
      if (index === -1) {
        e.items.unshift(action.payload)
      } else {
        e.items[index] = action.payload
      }
    },
    removeGrant(state, action: PayloadAction<{ userId: string; id: string }>) {
      const e = state.byUser[action.payload.userId]
      if (e) {
        e.items = e.items.filter((g) => g.id !== action.payload.id)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrants.pending, (state, action) => {
        const e = entry(state, action.meta.arg.userId)
        e.loading = true
        e.error = null
      })
      .addCase(fetchGrants.fulfilled, (state, action) => {
        const e = entry(state, action.meta.arg.userId)
        e.items = action.payload
        e.loading = false
        e.loaded = true
        e.loadedAt = Date.now()
      })
      .addCase(fetchGrants.rejected, (state, action) => {
        const e = entry(state, action.meta.arg.userId)
        e.loading = false
        e.error = action.error.message ?? "error"
      })
  },
})

export const { upsertGrant, removeGrant } = slice.actions
export const grantsReducer = slice.reducer
