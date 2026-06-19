import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import type { UserResponse } from "@/api/generated/model"

export type AuthStatus = "idle" | "loading" | "failed"

export interface AuthState {
  // The bearer token also lives in localStorage (the axios interceptor reads it
  // there); this mirror lets the UI react to identity changes. See lib/auth.ts.
  token: string | null
  user: UserResponse | null
  // True once the initial `me()` bootstrap has settled, so guards/screens know
  // whether "no user" means "not logged in" vs "still checking".
  bootstrapped: boolean
  status: AuthStatus
}

const initialState: AuthState = {
  token: null,
  user: null,
  bootstrapped: false,
  status: "idle",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload
    },
    setIdentity(
      state,
      action: PayloadAction<{ token: string; user: UserResponse | null }>
    ) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.status = "idle"
    },
    clearIdentity(state) {
      state.token = null
      state.user = null
      state.status = "idle"
    },
    markBootstrapped(state) {
      state.bootstrapped = true
    },
  },
})

export const { setAuthStatus, setIdentity, clearIdentity, markBootstrapped } =
  authSlice.actions
export const authReducer = authSlice.reducer
