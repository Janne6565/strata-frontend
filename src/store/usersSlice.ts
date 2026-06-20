import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { list as listUsers } from "@/api/generated/users/users"
import type { UserResponse } from "@/api/generated/model"
import { initialListState, isFresh, type ListState } from "@/store/cache"
import type { RootState } from "@/store/store"

type State = ListState<UserResponse>

const initialState: State = initialListState<UserResponse>()

export const fetchUsers = createAsyncThunk<
  UserResponse[],
  { force?: boolean } | undefined,
  { state: RootState }
>("users/fetch", () => listUsers(), {
  condition: (arg, { getState }) => !isFresh(getState().users, arg?.force),
})

const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    upsertUser(state, action: PayloadAction<UserResponse>) {
      const index = state.items.findIndex((u) => u.id === action.payload.id)
      if (index === -1) {
        state.items.push(action.payload)
      } else {
        state.items[index] = action.payload
      }
    },
    removeUser(state, action: PayloadAction<string>) {
      state.items = state.items.filter((u) => u.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.loaded = true
        state.loadedAt = Date.now()
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "error"
      })
  },
})

export const { upsertUser, removeUser } = slice.actions
export const usersReducer = slice.reducer
