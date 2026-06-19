import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  // Top-bar global search query (databases, tables…). Client-side UI state.
  globalSearch: string
}

const initialState: UiState = {
  globalSearch: "",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalSearch(state, action: PayloadAction<string>) {
      state.globalSearch = action.payload
    },
  },
})

export const { setGlobalSearch } = uiSlice.actions
export const uiReducer = uiSlice.reducer
