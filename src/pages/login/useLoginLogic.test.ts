import { AxiosError } from "axios"
import type { FormEvent } from "react"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { login } from "@/api/generated/authentication/authentication"
import { AUTH_TOKEN_KEY } from "@/lib/auth"
import { useLoginLogic } from "@/pages/login/useLoginLogic"
import { makeWrapper } from "@/test/makeWrapper"

const navigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
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
    globalThis.localStorage.clear()
  })

  it("trims the username, persists the token, and navigates home on success", async () => {
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
    expect(globalThis.localStorage.getItem(AUTH_TOKEN_KEY)).toBe("tok-123")
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
    expect(globalThis.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
    expect(result.current.isSubmitting).toBe(false)
  })
})
