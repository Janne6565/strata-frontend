import { AxiosError } from "axios"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import {
  addMember,
  create1,
  list1,
  removeMember,
  reorder,
} from "@/api/generated/groups/groups"
import { list2 } from "@/api/generated/inventory/inventory"
import { useGroupsLogic } from "@/pages/groups/useGroupsLogic"
import { makeWrapper } from "@/test/makeWrapper"

vi.mock("@/api/generated/groups/groups", () => ({
  list1: vi.fn(),
  create1: vi.fn(),
  rename: vi.fn(),
  _delete: vi.fn(),
  reorder: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
}))
vi.mock("@/api/generated/inventory/inventory", () => ({ list2: vi.fn() }))

const mockedList = vi.mocked(list1)
const mockedCreate = vi.mocked(create1)
const mockedReorder = vi.mocked(reorder)
const mockedAddMember = vi.mocked(addMember)
const mockedRemoveMember = vi.mocked(removeMember)

// Fresh array each call so a forced refetch yields a new reference.
const seed = () => [
  { id: "g1", name: "A", position: 0, datasourceIds: [] },
  { id: "g2", name: "B", position: 1, datasourceIds: [] },
]

function render() {
  return renderHook(() => useGroupsLogic(), { wrapper: makeWrapper() })
}

describe("useGroupsLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedList.mockImplementation(async () => seed())
    vi.mocked(list2).mockResolvedValue([])
  })

  it("lists groups ordered by position", async () => {
    const { result } = render()
    await waitFor(() => expect(result.current.groups).toHaveLength(2))
    expect(result.current.groups.map((g) => g.id)).toEqual(["g1", "g2"])
  })

  it("creates a group and upserts it without refetching", async () => {
    mockedCreate.mockResolvedValueOnce({ id: "g3", name: "C", position: 2 })
    const { result } = render()
    await waitFor(() => expect(result.current.groups).toHaveLength(2))

    await act(async () => {
      await result.current.create("C")
    })

    expect(mockedCreate).toHaveBeenCalledWith({ name: "C" })
    await waitFor(() =>
      expect(result.current.groups.map((g) => g.id)).toContain("g3")
    )
    expect(mockedList).toHaveBeenCalledTimes(1)
  })

  it("reorders optimistically and persists the new id order", async () => {
    mockedReorder.mockResolvedValueOnce(undefined)
    const { result } = render()
    await waitFor(() => expect(result.current.groups).toHaveLength(2))

    await act(async () => {
      await result.current.reorder(0, 1)
    })

    expect(result.current.groups.map((g) => g.id)).toEqual(["g2", "g1"])
    expect(mockedReorder).toHaveBeenCalledWith({ groupIds: ["g2", "g1"] })
  })

  it("reverts to the server order when reorder fails", async () => {
    const error = new AxiosError("Bad Request")
    error.response = {
      status: 400,
      data: { detail: "nope" },
      statusText: "Bad Request",
      headers: {},
      config: { headers: {} } as never,
    }
    mockedReorder.mockRejectedValueOnce(error)
    const { result } = render()
    await waitFor(() => expect(result.current.groups).toHaveLength(2))

    await act(async () => {
      await result.current.reorder(0, 1)
    })

    expect(result.current.errorMessage).not.toBeNull()
    await waitFor(() =>
      expect(result.current.groups.map((g) => g.id)).toEqual(["g1", "g2"])
    )
  })

  it("adds and removes a member, upserting the returned group", async () => {
    mockedAddMember.mockResolvedValueOnce({
      id: "g1",
      name: "A",
      position: 0,
      datasourceIds: ["ds-1"],
    })
    mockedRemoveMember.mockResolvedValueOnce({
      id: "g1",
      name: "A",
      position: 0,
      datasourceIds: [],
    })
    const { result } = render()
    await waitFor(() => expect(result.current.groups).toHaveLength(2))

    await act(async () => {
      await result.current.addMember("g1", "ds-1")
    })
    expect(mockedAddMember).toHaveBeenCalledWith("g1", { datasourceId: "ds-1" })
    await waitFor(() =>
      expect(
        result.current.groups.find((g) => g.id === "g1")?.datasourceIds
      ).toEqual(["ds-1"])
    )

    await act(async () => {
      await result.current.removeMember("g1", "ds-1")
    })
    expect(mockedRemoveMember).toHaveBeenCalledWith("g1", "ds-1")
    await waitFor(() =>
      expect(
        result.current.groups.find((g) => g.id === "g1")?.datasourceIds
      ).toEqual([])
    )
  })
})
