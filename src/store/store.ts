import { combineReducers, configureStore } from "@reduxjs/toolkit"

import { authReducer } from "@/store/authSlice"
import { uiReducer } from "@/store/uiSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
})

// Factory so tests can build an isolated store with preloaded state (see makeWrapper).
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  })
}

export const store = setupStore()

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore["dispatch"]
