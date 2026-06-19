import { AxiosError } from "axios"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import {
  create1,
  list1,
  reorder,
} from "@/api/generated/groups/groups"
import { useGroupsLogic } from "@/pages/groups/useGroupsLogic"

vi.mock("@/api/generated/groups/groups", () => ({
  list1: vi.fn(),
  create1: vi.fn(),
  rename: vi.fn(),
  _delete: vi.fn(),
  reorder: vi.fn(),
}))

const mockedList = vi.mocked(list1)
const mockedCreate = vi.mocked(create1)
const mockedReorder = vi.mocked(reorder)

// Fresh array each call so useDataLoading's data reference changes on reload.
const seed = () => [
  { id: "g1", name: "A", position: 0, datasourceIds: [] },
  { id: "g2", name: "B", position: 1, datasourceIds: [] },
]

describe("useGroupsLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedList.mockImplementation(async () => seed())
  })

  it("lists groups ordered by position", async () => {
    const { result } = renderHook(() => useGroupsLogic())
    await waitFor(() => expect(result.current.groups).toHaveLength(2))
    expect(result.current.groups.map((g) => g.id)).toEqual(["g1", "g2"])
  })

  it("creates a group then reloads", async () => {
    mockedCreate.mockResolvedValueOnce({ id: "g3", name: "C", position: 2 })
    const { result } = renderHook(() => useGroupsLogic())
    await waitFor(() => expect(result.current.groups).toHaveLength(2))

    await act(async () => {
      await result.current.create("C")
    })

    expect(mockedCreate).toHaveBeenCalledWith({ name: "C" })
    await waitFor(() => expect(mockedList).toHaveBeenCalledTimes(2))
  })

  it("reorders optimistically and persists the new id order", async () => {
    mockedReorder.mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useGroupsLogic())
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
    const { result } = renderHook(() => useGroupsLogic())
    await waitFor(() => expect(result.current.groups).toHaveLength(2))

    await act(async () => {
      await result.current.reorder(0, 1)
    })

    expect(result.current.errorMessage).not.toBeNull()
    await waitFor(() =>
      expect(result.current.groups.map((g) => g.id)).toEqual(["g1", "g2"])
    )
  })
})
