/**
 * How an object-storage file is previewed. The mode is guessed from the file
 * extension, then the stored content type; files with neither (or an unknown
 * one) get no default and the user picks a mode by hand. The stored content
 * type is uploader-controlled, so it only ever *suggests* a mode: bytes are
 * always rendered through an inert element (img/video/audio/pdf viewer/plain
 * text) and never as an HTML document.
 */
export type PreviewMode = "image" | "video" | "audio" | "pdf" | "text"

export const PREVIEW_MODES: readonly PreviewMode[] = [
  "text",
  "image",
  "video",
  "audio",
  "pdf",
]

/** Files above this size are offered for download only, never fetched for preview. */
export const PREVIEW_MAX_BYTES = 50 * 1024 * 1024

/** Text previews show at most this many bytes (the rest is a download away). */
export const TEXT_PREVIEW_BYTES = 1024 * 1024

const IMAGE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  bmp: "image/bmp",
  ico: "image/x-icon",
  svg: "image/svg+xml",
}
const VIDEO: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  ogv: "video/ogg",
}
const AUDIO: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  aac: "audio/aac",
  opus: "audio/ogg",
}
const TEXT = new Set([
  "txt",
  "md",
  "markdown",
  "log",
  "csv",
  "tsv",
  "json",
  "jsonl",
  "ndjson",
  "yaml",
  "yml",
  "toml",
  "ini",
  "conf",
  "cfg",
  "env",
  "properties",
  "xml",
  "html",
  "htm",
  "css",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "java",
  "kt",
  "py",
  "rb",
  "go",
  "rs",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "php",
  "sh",
  "bash",
  "zsh",
  "sql",
  "graphql",
  "gql",
  "m3u8",
  "srt",
  "vtt",
  "dockerfile",
  "gitignore",
])

/** Lower-cased extension of the file name, or "" when it has none. */
export function extensionOf(name: string): string {
  const base = name.slice(name.lastIndexOf("/") + 1)
  const dot = base.lastIndexOf(".")
  return dot <= 0 ? "" : base.slice(dot + 1).toLowerCase()
}

/** The best-guess preview mode, or null when the user has to choose. */
export function detectPreviewMode(
  name: string,
  contentType?: string | null
): PreviewMode | null {
  const ext = extensionOf(name)
  if (ext in IMAGE) return "image"
  if (ext in VIDEO) return "video"
  if (ext in AUDIO) return "audio"
  if (ext === "pdf") return "pdf"
  if (TEXT.has(ext)) return "text"

  const type = (contentType ?? "").split(";")[0].trim().toLowerCase()
  if (type.startsWith("image/")) return "image"
  if (type.startsWith("video/")) return "video"
  if (type.startsWith("audio/")) return "audio"
  if (type === "application/pdf") return "pdf"
  if (
    type.startsWith("text/") ||
    type === "application/json" ||
    type === "application/xml" ||
    type.endsWith("+json") ||
    type.endsWith("+xml")
  ) {
    return "text"
  }
  return null
}

/**
 * The MIME type to stamp on the local Blob for `mode`. Derived from the mode
 * (and extension) — never from the stored content type — so a file can only be
 * interpreted the way the chosen viewer interprets it. Image/media elements
 * sniff the real format themselves, so a generic type is fine when the
 * extension doesn't say.
 */
export function blobTypeFor(mode: PreviewMode, name: string): string {
  const ext = extensionOf(name)
  switch (mode) {
    case "image":
      return IMAGE[ext] ?? "image/*"
    case "video":
      return VIDEO[ext] ?? "video/*"
    case "audio":
      return AUDIO[ext] ?? "audio/*"
    case "pdf":
      return "application/pdf"
    case "text":
      return "text/plain"
  }
}

/** Heuristic: NUL bytes in the first few KB mean the file isn't text. */
export function looksBinary(bytes: Uint8Array): boolean {
  const sample = bytes.subarray(0, 8192)
  return sample.includes(0)
}
