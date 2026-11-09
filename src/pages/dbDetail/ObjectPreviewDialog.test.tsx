import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { fetchObject } from "@/api/objects"
import { ObjectPreviewDialog } from "@/pages/dbDetail/ObjectPreviewDialog"
import type { PreviewTarget } from "@/pages/dbDetail/useObjectPreviewLogic"

vi.mock("@/api/objects", () => ({ fetchObject: vi.fn() }))
const mockedFetch = vi.mocked(fetchObject)

function open(target: PreviewTarget) {
  render(
    <ObjectPreviewDialog
      datasourceId="ds-1"
      target={target}
      onClose={vi.fn()}
    />
  )
}

const file = (name: string, size: number | null = 5): PreviewTarget => ({
  bucket: "docs",
  key: `notes/${name}`,
  name,
  size,
})

describe("ObjectPreviewDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = vi.fn(() => "blob:preview")
    URL.revokeObjectURL = vi.fn()
  })

  it("previews text files detected by extension", async () => {
    mockedFetch.mockResolvedValueOnce(
      new Blob(["hello"], { type: "text/plain" })
    )

    open(file("readme.md"))

    expect(await screen.findByText("hello")).toBeInTheDocument()
    expect(mockedFetch).toHaveBeenCalledWith("ds-1", "docs", "notes/readme.md")
    expect(screen.getByRole("radio", { name: "Text" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
  })

  it("asks for a mode when a file has no extension, then renders the choice", async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce(
      new Blob(["plain words"], { type: "application/octet-stream" })
    )

    open(file("LICENSE"))

    expect(await screen.findByText("Unknown file type")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Text" }))
    expect(await screen.findByText("plain words")).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Image" }))
    await waitFor(() => expect(screen.getByRole("img")).toBeInTheDocument())
    expect(screen.getByRole("img")).toHaveAttribute("src", "blob:preview")
  })

  it("never renders HTML: the image blob is re-typed from the chosen mode", async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce(
      new Blob(["<script>x</script>"], { type: "text/html" })
    )

    open(file("page"))

    // text/html content type suggests the text viewer, shown as literal source.
    expect(await screen.findByText("<script>x</script>")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "PDF" }))
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    expect(blob.type).toBe("application/pdf")
  })

  it("doesn't fetch files over the preview limit", () => {
    open(file("huge.bin", 200 * 1024 * 1024))

    expect(screen.getByText(/larger than 50 MB/)).toBeInTheDocument()
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})
