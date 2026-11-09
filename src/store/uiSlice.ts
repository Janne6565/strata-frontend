import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  // Top-bar global search query (databases, tables…). Client-side UI state.
  globalSearch: string
  // Last engine chip picked on the databases list (mirrors its ?engine= param),
  // so links back to the list from other screens restore the filter.
  inventoryEngine: string | null
}

const initialState: UiState = {
  globalSearch: "",
  inventoryEngine: null,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalSearch(state, action: PayloadAction<string>) {
      state.globalSearch = action.payload
    },
    setInventoryEngine(state, action: PayloadAction<string | null>) {
      state.inventoryEngine = action.payload
    },
  },
})

export const { setGlobalSearch, setInventoryEngine } = uiSlice.actions
export const uiReducer = uiSlice.reducer
