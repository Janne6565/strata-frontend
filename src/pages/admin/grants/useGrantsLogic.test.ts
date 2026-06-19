import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { create2, listForUser, revoke } from "@/api/generated/grants/grants"
import { list2 } from "@/api/generated/inventory/inventory"
import { list } from "@/api/generated/users/users"
import { useGrantsLogic } from "@/pages/admin/grants/useGrantsLogic"

vi.mock("@/api/generated/grants/grants", () => ({
  listForUser: vi.fn(),
  create2: vi.fn(),
  revoke: vi.fn(),
}))
vi.mock("@/api/generated/inventory/inventory", () => ({ list2: vi.fn() }))
vi.mock("@/api/generated/users/users", () => ({ list: vi.fn() }))

const mockedListForUser = vi.mocked(listForUser)
const mockedCreate = vi.mocked(create2)
const mockedRevoke = vi.mocked(revoke)

describe("useGrantsLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(list).mockResolvedValue([
      { id: "u1", username: "alice", role: "USER", enabled: true },
    ])
    vi.mocked(list2).mockResolvedValue([])
    mockedListForUser.mockResolvedValue([])
  })

  it("starts empty and loads grants when a user is selected", async () => {
    mockedListForUser.mockResolvedValueOnce([
      {
        id: "gr1",
        userId: "u1",
        scopeType: "NAMESPACE",
        namespace: "team-a",
        readOnly: true,
      },
    ])
    const { result } = renderHook(() => useGrantsLogic())
    expect(result.current.status).toBe("empty")

    await act(async () => {
      result.current.selectUser("u1")
    })

    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(mockedListForUser).toHaveBeenCalledWith({ userId: "u1" })
    expect(result.current.grants).toHaveLength(1)
  })

  it("creates a grant then reloads the selected user's grants", async () => {
    mockedCreate.mockResolvedValueOnce({ id: "gr2" })
    const { result } = renderHook(() => useGrantsLogic())
    await act(async () => {
      result.current.selectUser("u1")
    })
    await waitFor(() => expect(result.current.status).toBe("idle"))

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.createGrant({
        userId: "u1",
        scopeType: "NAMESPACE",
        namespace: "team-b",
        readOnly: true,
      })
    })

    expect(ok).toBe(true)
    expect(mockedCreate).toHaveBeenCalledWith({
      userId: "u1",
      scopeType: "NAMESPACE",
      namespace: "team-b",
      readOnly: true,
    })
    expect(mockedListForUser).toHaveBeenCalledTimes(2)
  })

  it("revokes a grant", async () => {
    mockedRevoke.mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useGrantsLogic())
    await act(async () => {
      result.current.selectUser("u1")
    })
    await waitFor(() => expect(result.current.status).toBe("idle"))

    await act(async () => {
      await result.current.revokeGrant("gr1")
    })

    expect(mockedRevoke).toHaveBeenCalledWith("gr1")
    expect(mockedListForUser).toHaveBeenCalledTimes(2)
  })
})
