import { AxiosError } from "axios"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { runExecute, runQuery } from "@/api/generated/browse/browse"
import { useQueryConsoleLogic } from "@/pages/dbDetail/useQueryConsoleLogic"

vi.mock("@/api/generated/browse/browse", () => ({
  runQuery: vi.fn(),
  runExecute: vi.fn(),
}))

const mockedRun = vi.mocked(runQuery)
const mockedExecute = vi.mocked(runExecute)

describe("useQueryConsoleLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("runs a read query and stores the result", async () => {
    mockedRun.mockResolvedValueOnce({ columns: ["id"], rows: [[1]] })

    const { result } = renderHook(() => useQueryConsoleLogic("ds-1"))
    act(() => result.current.setSql("select 1"))
    await act(async () => {
      await result.current.run()
    })

    expect(mockedRun).toHaveBeenCalledWith("ds-1", { sql: "select 1" })
    expect(result.current.result?.rows).toEqual([[1]])
    expect(result.current.status).toBe("idle")
  })

  it("does not call the API for empty sql", async () => {
    const { result } = renderHook(() => useQueryConsoleLogic("ds-1"))
    await act(async () => {
      await result.current.run()
    })
    expect(mockedRun).not.toHaveBeenCalled()
  })

  it("routes writes to execute and surfaces the ProblemDetail on failure", async () => {
    const error = new AxiosError("Forbidden")
    error.response = {
      status: 403,
      data: { detail: "Read-only datasource" },
      statusText: "Forbidden",
      headers: {},
      config: { headers: {} } as never,
    }
    mockedExecute.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useQueryConsoleLogic("ds-1"))
    act(() => result.current.setSql("delete from t"))
    await act(async () => {
      await result.current.execute()
    })

    expect(mockedExecute).toHaveBeenCalledWith("ds-1", { sql: "delete from t" })
    expect(result.current.errorMessage).toBe("Read-only datasource")
    expect(result.current.status).toBe("failed")
  })
})
