import { describe, expect, it } from "vitest"

import type { UserResponse } from "@/api/generated/model"
import {
  authReducer,
  clearIdentity,
  markBootstrapped,
  setAuthStatus,
  setIdentity,
  type AuthState,
} from "@/store/authSlice"

const initialState: AuthState = {
  token: null,
  user: null,
  bootstrapped: false,
  status: "idle",
}

const user: UserResponse = {
  id: "u-1",
  username: "owner",
  role: "OWNER",
  enabled: true,
}

describe("authSlice", () => {
  it("returns the initial state", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState)
  })

  it("sets the status", () => {
    expect(authReducer(initialState, setAuthStatus("loading")).status).toBe(
      "loading"
    )
  })

  it("stores token + user and resets status to idle on setIdentity", () => {
    const loading: AuthState = { ...initialState, status: "loading" }
    const next = authReducer(loading, setIdentity({ token: "tok", user }))
    expect(next.token).toBe("tok")
    expect(next.user).toEqual(user)
    expect(next.status).toBe("idle")
  })

  it("accepts a null user on setIdentity", () => {
    const next = authReducer(initialState, setIdentity({ token: "tok", user: null }))
    expect(next.token).toBe("tok")
    expect(next.user).toBeNull()
  })

  it("clears token + user on clearIdentity without touching bootstrapped", () => {
    const loggedIn: AuthState = {
      token: "tok",
      user,
      bootstrapped: true,
      status: "idle",
    }
    const next = authReducer(loggedIn, clearIdentity())
    expect(next.token).toBeNull()
    expect(next.user).toBeNull()
    expect(next.bootstrapped).toBe(true)
  })

  it("marks bootstrapped", () => {
    expect(authReducer(initialState, markBootstrapped()).bootstrapped).toBe(true)
  })
})
