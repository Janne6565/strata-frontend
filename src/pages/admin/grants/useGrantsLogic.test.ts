import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { create2, listForUser, revoke } from "@/api/generated/grants/grants"
import { list2 } from "@/api/generated/inventory/inventory"
import { list } from "@/api/generated/users/users"
import { useGrantsLogic } from "@/pages/admin/grants/useGrantsLogic"
import { makeWrapper } from "@/test/makeWrapper"

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

function render() {
  return renderHook(() => useGrantsLogic(), { wrapper: makeWrapper() })
}

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
    const { result } = render()
    expect(result.current.status).toBe("empty")

    act(() => {
      result.current.selectUser("u1")
    })

    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(mockedListForUser).toHaveBeenCalledWith({ userId: "u1" })
    expect(result.current.grants).toHaveLength(1)
  })

  it("creates a grant and upserts it into the store", async () => {
    mockedCreate.mockResolvedValueOnce({ id: "gr2", userId: "u1" })
    const { result } = render()
    act(() => {
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
    await waitFor(() =>
      expect(result.current.grants.map((g) => g.id)).toContain("gr2")
    )
    // mount fetch only — the create upserts, no refetch
    expect(mockedListForUser).toHaveBeenCalledTimes(1)
  })

  it("revokes a grant and removes it from the store", async () => {
    mockedListForUser.mockResolvedValueOnce([
      { id: "gr1", userId: "u1", scopeType: "NAMESPACE", namespace: "x" },
    ])
    mockedRevoke.mockResolvedValueOnce(undefined)
    const { result } = render()
    act(() => {
      result.current.selectUser("u1")
    })
    await waitFor(() => expect(result.current.grants).toHaveLength(1))

    await act(async () => {
      await result.current.revokeGrant("gr1")
    })

    expect(mockedRevoke).toHaveBeenCalledWith("gr1")
    await waitFor(() => expect(result.current.grants).toHaveLength(0))
  })
})
