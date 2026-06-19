import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { DatasourceResponse } from "@/api/generated/model"
import {
  list2 as listDatasources,
  rescan as rescanCluster,
} from "@/api/generated/inventory/inventory"
import { useInventoryLogic } from "@/pages/inventory/useInventoryLogic"
import type { AuthState } from "@/store/authSlice"
import { makeWrapper } from "@/test/makeWrapper"

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock("@/api/generated/inventory/inventory", () => ({
  list2: vi.fn(),
  rescan: vi.fn(),
}))

const mockedList = vi.mocked(listDatasources)
const mockedRescan = vi.mocked(rescanCluster)

const ds = (over: Partial<DatasourceResponse>): DatasourceResponse => ({
  id: "id",
  status: "PRESENT",
  origin: "DISCOVERED",
  ...over,
})

const ownerAuth: AuthState = {
  token: "tok",
  user: { id: "u", username: "owner", role: "OWNER", enabled: true },
  bootstrapped: true,
  status: "idle",
}

describe("useInventoryLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads the catalog and reports total + idle status", async () => {
    mockedList.mockResolvedValueOnce([
      ds({ id: "a", displayName: "orders" }),
      ds({ id: "b", displayName: "cache" }),
    ])

    const { result } = renderHook(() => useInventoryLogic(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(result.current.datasources).toHaveLength(2)
    expect(result.current.total).toBe(2)
    expect(result.current.isAdmin).toBe(false)
  })

  it("filters by the global search query", async () => {
    mockedList.mockResolvedValueOnce([
      ds({ id: "a", displayName: "orders", driver: "postgres" }),
      ds({ id: "b", displayName: "cache", driver: "redis" }),
    ])

    const { result } = renderHook(() => useInventoryLogic(), {
      wrapper: makeWrapper({ ui: { globalSearch: "redis" } }),
    })

    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(result.current.datasources).toHaveLength(1)
    expect(result.current.datasources[0]?.id).toBe("b")
    expect(result.current.isFiltered).toBe(true)
  })

  it("exposes isAdmin and reloads the catalog after a rescan", async () => {
    mockedList.mockResolvedValue([ds({ id: "a", displayName: "orders" })])
    mockedRescan.mockResolvedValueOnce({ created: 1, updated: 0, markedMissing: 0, matched: 1 })

    const { result } = renderHook(() => useInventoryLogic(), {
      wrapper: makeWrapper({ auth: ownerAuth }),
    })

    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(result.current.isAdmin).toBe(true)

    await result.current.rescan()

    expect(mockedRescan).toHaveBeenCalledOnce()
    // Once on mount, once after the rescan-triggered reload.
    await waitFor(() => expect(mockedList).toHaveBeenCalledTimes(2))
  })
})
