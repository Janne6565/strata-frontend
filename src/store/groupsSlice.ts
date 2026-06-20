import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { list1 as listGroups } from "@/api/generated/groups/groups"
import type { GroupResponse } from "@/api/generated/model"
import { initialListState, isFresh, type ListState } from "@/store/cache"
import type { RootState } from "@/store/store"

type State = ListState<GroupResponse>

const initialState: State = initialListState<GroupResponse>()

export const fetchGroups = createAsyncThunk<
  GroupResponse[],
  { force?: boolean } | undefined,
  { state: RootState }
>("groups/fetch", () => listGroups(), {
  condition: (arg, { getState }) => !isFresh(getState().groups, arg?.force),
})

const slice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    upsertGroup(state, action: PayloadAction<GroupResponse>) {
      const index = state.items.findIndex((g) => g.id === action.payload.id)
      if (index === -1) {
        state.items.push(action.payload)
      } else {
        state.items[index] = action.payload
      }
    },
    removeGroup(state, action: PayloadAction<string>) {
      state.items = state.items.filter((g) => g.id !== action.payload)
    },
    // Replaces the list wholesale — used for optimistic drag-reorder.
    setGroups(state, action: PayloadAction<GroupResponse[]>) {
      state.items = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.loaded = true
        state.loadedAt = Date.now()
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "error"
      })
  },
})

export const { upsertGroup, removeGroup, setGroups } = slice.actions
export const groupsReducer = slice.reducer
