import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ObjectView } from "@/pages/dbDetail/ObjectView"

const COLUMNS = [
  "name",
  "key",
  "type",
  "size",
  "last_modified",
  "etag",
  "storage_class",
]
const ROWS = [
  ["raw/", "2024/raw/", "folder", null, null, null, null],
  [
    "a.jpg",
    "2024/a.jpg",
    "object",
    1536,
    "2026-11-01T12:00:00.000Z",
    "abc",
    "STANDARD",
  ],
]

function renderView(onOpen = vi.fn(), onPreview = vi.fn()) {
  render(
    <ObjectView
      bucket="photos"
      prefix="2024/"
      columns={COLUMNS}
      rows={ROWS}
      sort={null}
      onToggleSort={vi.fn()}
      onOpen={onOpen}
      onPreview={onPreview}
    />
  )
  return onOpen
}

describe("ObjectView", () => {
  it("opens a file's preview on click", async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()
    renderView(vi.fn(), onPreview)

    await user.click(screen.getByText("a.jpg"))

    expect(onPreview).toHaveBeenCalledWith({
      key: "2024/a.jpg",
      name: "a.jpg",
      size: 1536,
    })
  })

  it("shows object sizes in human units", () => {
    renderView()
    expect(screen.getByText("a.jpg")).toBeInTheDocument()
    expect(screen.getByText("1.5 KB")).toBeInTheDocument()
  })

  it("opens folders, parents and breadcrumbs by prefix", async () => {
    const user = userEvent.setup()
    const onOpen = renderView()

    await user.click(screen.getByText("raw/"))
    expect(onOpen).toHaveBeenLastCalledWith("2024/raw/")

    await user.click(screen.getByText(".."))
    expect(onOpen).toHaveBeenLastCalledWith("")

    await user.click(screen.getByRole("button", { name: "photos" }))
    expect(onOpen).toHaveBeenLastCalledWith("")
    expect(screen.getByRole("button", { name: "2024" })).toBeDisabled()
  })
})
