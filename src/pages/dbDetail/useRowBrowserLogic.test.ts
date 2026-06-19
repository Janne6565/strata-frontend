import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { browse } from "@/api/generated/browse/browse"
import type { TableInfo } from "@/api/generated/model"
import { useRowBrowserLogic } from "@/pages/dbDetail/useRowBrowserLogic"

vi.mock("@/api/generated/browse/browse", () => ({
  browse: vi.fn(),
}))

const mockedBrowse = vi.mocked(browse)
const table: TableInfo = { schema: "public", name: "orders", columns: [] }

describe("useRowBrowserLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads the first page when a table is selected", async () => {
    mockedBrowse.mockResolvedValueOnce({
      columns: ["id"],
      rows: [[1]],
      offset: 0,
      limit: 50,
    })

    const { result } = renderHook(() => useRowBrowserLogic("ds-1"))
    await act(async () => {
      result.current.select(table)
    })

    await waitFor(() => expect(result.current.status).toBe("idle"))
    expect(mockedBrowse).toHaveBeenCalledWith("ds-1", "public", "orders", {
      offset: 0,
      limit: 50,
    })
    expect(result.current.selected?.name).toBe("orders")
    expect(result.current.canPrev).toBe(false)
  })

  it("pages forward by the page size", async () => {
    const fullPage = {
      columns: ["id"],
      rows: Array.from({ length: 50 }, (_, i) => [i]),
      offset: 0,
      limit: 50,
    }
    mockedBrowse
      .mockResolvedValueOnce(fullPage)
      .mockResolvedValueOnce({ columns: ["id"], rows: [[99]], offset: 50, limit: 50 })

    const { result } = renderHook(() => useRowBrowserLogic("ds-1"))
    await act(async () => {
      result.current.select(table)
    })
    await waitFor(() => expect(result.current.canNext).toBe(true))

    await act(async () => {
      result.current.next()
    })

    await waitFor(() =>
      expect(mockedBrowse).toHaveBeenLastCalledWith("ds-1", "public", "orders", {
        offset: 50,
        limit: 50,
      })
    )
    await waitFor(() => expect(result.current.canPrev).toBe(true))
  })
})
