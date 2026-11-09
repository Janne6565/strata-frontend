import { describe, expect, it } from "vitest"

import {
  blobTypeFor,
  detectPreviewMode,
  extensionOf,
  looksBinary,
} from "@/lib/filePreview"

describe("filePreview", () => {
  it("reads extensions, ignoring dotfiles and folders", () => {
    expect(extensionOf("photos/2024/a.JPG")).toBe("jpg")
    expect(extensionOf("v1.2/README")).toBe("")
    expect(extensionOf(".env")).toBe("")
    expect(extensionOf("archive.tar.gz")).toBe("gz")
  })

  it("detects the mode from the extension first", () => {
    expect(detectPreviewMode("a.png", "application/octet-stream")).toBe("image")
    expect(detectPreviewMode("clip.webm")).toBe("video")
    expect(detectPreviewMode("song.flac")).toBe("audio")
    expect(detectPreviewMode("doc.pdf")).toBe("pdf")
    expect(detectPreviewMode("config.yaml")).toBe("text")
  })

  it("falls back to the stored content type", () => {
    expect(detectPreviewMode("blob", "image/webp")).toBe("image")
    expect(detectPreviewMode("data", "application/json; charset=utf-8")).toBe(
      "text"
    )
  })

  it("leaves extension-less, untyped files to the user", () => {
    expect(detectPreviewMode("blob", "application/octet-stream")).toBeNull()
    expect(detectPreviewMode("blob")).toBeNull()
    expect(detectPreviewMode("archive.zip")).toBeNull()
  })

  it("never derives the blob type from the stored content type", () => {
    expect(blobTypeFor("text", "page.html")).toBe("text/plain")
    expect(blobTypeFor("pdf", "blob")).toBe("application/pdf")
    expect(blobTypeFor("image", "blob")).toBe("image/*")
    expect(blobTypeFor("image", "x.svg")).toBe("image/svg+xml")
  })

  it("spots binary content", () => {
    expect(looksBinary(new Uint8Array([104, 105]))).toBe(false)
    expect(looksBinary(new Uint8Array([104, 0, 105]))).toBe(true)
  })
})
