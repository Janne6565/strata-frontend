import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { list2 as listDatasources } from "@/api/generated/inventory/inventory"
import type { DatasourceResponse } from "@/api/generated/model"
import { initialListState, isFresh, type ListState } from "@/store/cache"
import type { RootState } from "@/store/store"

type State = ListState<DatasourceResponse>

const initialState: State = initialListState<DatasourceResponse>()

export const fetchDatasources = createAsyncThunk<
  DatasourceResponse[],
  { force?: boolean } | undefined,
  { state: RootState }
>("datasources/fetch", () => listDatasources(), {
  condition: (arg, { getState }) => !isFresh(getState().datasources, arg?.force),
})

const slice = createSlice({
  name: "datasources",
  initialState,
  reducers: {
    upsertDatasource(state, action: PayloadAction<DatasourceResponse>) {
      const index = state.items.findIndex((d) => d.id === action.payload.id)
      if (index === -1) {
        state.items.unshift(action.payload)
      } else {
        state.items[index] = action.payload
      }
    },
    removeDatasource(state, action: PayloadAction<string>) {
      state.items = state.items.filter((d) => d.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDatasources.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDatasources.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.loaded = true
        state.loadedAt = Date.now()
      })
      .addCase(fetchDatasources.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "error"
      })
  },
})

export const { upsertDatasource, removeDatasource } = slice.actions
export const datasourcesReducer = slice.reducer
