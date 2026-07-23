import { AxiosError } from "axios"
import type { FormEvent } from "react"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { login } from "@/api/generated/authentication/authentication"
import { clearAuthToken, getAuthToken } from "@/lib/auth"
import { useLoginLogic } from "@/pages/login/useLoginLogic"
import { makeWrapper } from "@/test/makeWrapper"

const navigate = vi.fn()

// The hook reads the /login route's search params through getRouteApi; this
// mutable value lets each test drive the `oauthError` param.
let searchValue: { oauthError?: "noAccess" | boolean } = {}

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  getRouteApi: () => ({ useSearch: () => searchValue }),
}))

vi.mock("@/api/generated/authentication/authentication", () => ({
  login: vi.fn(),
}))

const mockedLogin = vi.mocked(login)

// A submit event whose only relevant behavior is preventDefault.
const submitEvent = {
  preventDefault: vi.fn(),
} as unknown as FormEvent<HTMLFormElement>

function renderLoginLogic() {
  return renderHook(() => useLoginLogic(), { wrapper: makeWrapper() })
}

describe("useLoginLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuthToken()
    searchValue = {}
  })

  it("trims the username, keeps the token in memory, and navigates home on success", async () => {
    mockedLogin.mockResolvedValueOnce({
      token: "tok-123",
      expiresAt: "2026-01-01T00:00:00Z",
      user: { id: "u-1", username: "owner", role: "OWNER", enabled: true },
    })

    const { result } = renderLoginLogic()
    act(() => {
      result.current.setUsername("  owner  ")
      result.current.setPassword("pw")
    })
    await act(async () => {
      await result.current.submit(submitEvent)
    })

    expect(mockedLogin).toHaveBeenCalledWith({
      username: "owner",
      password: "pw",
    })
    expect(getAuthToken()).toBe("tok-123")
    expect(globalThis.localStorage.getItem("strata.token")).toBeNull()
    expect(navigate).toHaveBeenCalledWith({ to: "/" })
    expect(result.current.errorMessage).toBeNull()
  })

  it("surfaces the backend ProblemDetail and does not navigate on failure", async () => {
    const error = new AxiosError("Unauthorized")
    error.response = {
      status: 401,
      data: { detail: "Invalid credentials" },
      statusText: "Unauthorized",
      headers: {},
      config: { headers: {} } as never,
    }
    mockedLogin.mockRejectedValueOnce(error)

    const { result } = renderLoginLogic()
    act(() => {
      result.current.setUsername("owner")
      result.current.setPassword("wrong")
    })
    await act(async () => {
      await result.current.submit(submitEvent)
    })

    expect(result.current.errorMessage).toBe("Invalid credentials")
    expect(getAuthToken()).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
    expect(result.current.isSubmitting).toBe(false)
  })

  it("maps oauthError=noAccess to the no-access message", () => {
    searchValue = { oauthError: "noAccess" }
    const { result } = renderLoginLogic()
    expect(result.current.oauthErrorMessage).toContain("Strata access group")
  })

  it("maps a generic oauthError to the generic failure message", () => {
    searchValue = { oauthError: true }
    const { result } = renderLoginLogic()
    expect(result.current.oauthErrorMessage).toContain("failed")
  })

  it("exposes no oauth error message when the param is absent", () => {
    const { result } = renderLoginLogic()
    expect(result.current.oauthErrorMessage).toBeNull()
  })

  it("navigates the browser to the Authentik authorize endpoint", () => {
    const originalLocation = globalThis.location
    const locationStub = { href: "" }
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: locationStub,
    })

    try {
      const { result } = renderLoginLogic()
      act(() => {
        result.current.startAuthentikLogin()
      })
      expect(locationStub.href).toBe(
        "/api/v1/auth/oauth/authentik/authorize"
      )
    } finally {
      Object.defineProperty(globalThis, "location", {
        configurable: true,
        value: originalLocation,
      })
    }
  })
})
