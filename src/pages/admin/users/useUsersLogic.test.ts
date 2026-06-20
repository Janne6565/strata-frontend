import { AxiosError } from "axios"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { changeRole, create, delete1, list } from "@/api/generated/users/users"
import { useUsersLogic } from "@/pages/admin/users/useUsersLogic"
import type { AuthState } from "@/store/authSlice"
import { makeWrapper } from "@/test/makeWrapper"

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }))
vi.mock("@/api/generated/users/users", () => ({
  list: vi.fn(),
  create: vi.fn(),
  changeRole: vi.fn(),
  delete1: vi.fn(),
}))

const mockedList = vi.mocked(list)
const mockedCreate = vi.mocked(create)
const mockedChangeRole = vi.mocked(changeRole)
const mockedDelete = vi.mocked(delete1)

const ownerAuth: AuthState = {
  token: "tok",
  user: { id: "owner-id", username: "owner", role: "OWNER", enabled: true },
  bootstrapped: true,
  status: "idle",
}

function render() {
  return renderHook(() => useUsersLogic(), {
    wrapper: makeWrapper({ auth: ownerAuth }),
  })
}

describe("useUsersLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedList.mockResolvedValue([
      { id: "owner-id", username: "owner", role: "OWNER", enabled: true },
    ])
  })

  it("loads users from the cache and exposes the current user id", async () => {
    const { result } = render()
    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(result.current.users).toHaveLength(1)
    expect(result.current.currentUserId).toBe("owner-id")
  })

  it("creates a user and upserts it into the store without refetching", async () => {
    mockedCreate.mockResolvedValueOnce({
      id: "u2",
      username: "bob",
      role: "USER",
      enabled: true,
    })
    const { result } = render()
    await waitFor(() => expect(result.current.status).toBe("idle"))

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.createUser({
        username: "bob",
        password: "password1",
        role: "USER",
      })
    })

    expect(ok).toBe(true)
    expect(mockedCreate).toHaveBeenCalledWith({
      username: "bob",
      password: "password1",
      role: "USER",
    })
    await waitFor(() =>
      expect(result.current.users.map((u) => u.id)).toContain("u2")
    )
    expect(mockedList).toHaveBeenCalledTimes(1) // upsert, not refetch
  })

  it("surfaces the ProblemDetail when a mutation fails", async () => {
    const error = new AxiosError("Conflict")
    error.response = {
      status: 409,
      data: { detail: "Username already exists" },
      statusText: "Conflict",
      headers: {},
      config: { headers: {} } as never,
    }
    mockedCreate.mockRejectedValueOnce(error)
    const { result } = render()
    await waitFor(() => expect(result.current.status).toBe("idle"))

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.createUser({
        username: "bob",
        password: "password1",
        role: "USER",
      })
    })

    expect(ok).toBe(false)
    expect(result.current.errorMessage).toBe("Username already exists")
  })

  it("changes a role and deletes through the API + store", async () => {
    mockedChangeRole.mockResolvedValueOnce({
      id: "owner-id",
      username: "owner",
      role: "ADMIN",
      enabled: true,
    })
    mockedDelete.mockResolvedValueOnce(undefined)
    const { result } = render()
    await waitFor(() => expect(result.current.status).toBe("idle"))

    await act(async () => {
      await result.current.changeRole("owner-id", "ADMIN")
    })
    expect(mockedChangeRole).toHaveBeenCalledWith("owner-id", { role: "ADMIN" })
    await waitFor(() =>
      expect(result.current.users[0]?.role).toBe("ADMIN")
    )

    await act(async () => {
      await result.current.removeUser("owner-id")
    })
    expect(mockedDelete).toHaveBeenCalledWith("owner-id")
    await waitFor(() => expect(result.current.users).toHaveLength(0))
  })
})
