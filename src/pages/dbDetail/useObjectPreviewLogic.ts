import axios from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { fetchObject } from "@/api/objects"
import { saveBlob } from "@/lib/download"
import { extractProblemDetail } from "@/lib/errors"
import {
  PREVIEW_MAX_BYTES,
  TEXT_PREVIEW_BYTES,
  blobTypeFor,
  detectPreviewMode,
  looksBinary,
} from "@/lib/filePreview"
import type { PreviewMode } from "@/lib/filePreview"

/** The object a preview is open for. `size` is null when the listing didn't say. */
export interface PreviewTarget {
  readonly bucket: string
  readonly key: string
  readonly name: string
  readonly size: number | null
}

type Status = "loading" | "ready" | "tooLarge" | "failed"

interface TextPreview {
  readonly text: string
  readonly truncated: boolean
  readonly binary: boolean
}

/**
 * Error bodies of a `responseType: "blob"` request arrive as a Blob, so the
 * usual ProblemDetail extraction has to read and parse it first.
 */
async function errorMessage(error: unknown): Promise<string | null> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await error.response.data.text()) as {
        detail?: unknown
      }
      return typeof parsed.detail === "string" ? parsed.detail : null
    } catch {
      return null
    }
  }
  return extractProblemDetail(error)
}

/**
 * Loads an object once and renders it in a user-switchable preview mode. The
 * initial mode is guessed from the name, then the served content type; when
 * neither says (e.g. no extension) `mode` stays null and the user picks one.
 * Files over PREVIEW_MAX_BYTES are never fetched for preview — download only.
 */
export function useObjectPreviewLogic(
  datasourceId: string,
  target: PreviewTarget
) {
  const { t } = useTranslation()
  const tooLarge = target.size != null && target.size > PREVIEW_MAX_BYTES
  const [status, setStatus] = useState<Status>(
    tooLarge ? "tooLarge" : "loading"
  )
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chosenMode, setChosenMode] = useState<PreviewMode | null>(null)
  const [text, setText] = useState<TextPreview | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (tooLarge) {
      return
    }
    let cancelled = false
    fetchObject(datasourceId, target.bucket, target.key)
      .then((result) => {
        if (!cancelled) {
          setBlob(result)
          setStatus("ready")
        }
      })
      .catch(async (cause: unknown) => {
        const message = await errorMessage(cause)
        if (!cancelled) {
          setError(message ?? t("detail.preview.loadError"))
          setStatus("failed")
        }
      })
    return () => {
      cancelled = true
    }
  }, [datasourceId, target.bucket, target.key, tooLarge, t])

  const detectedMode = useMemo(
    () => detectPreviewMode(target.name, blob?.type),
    [target.name, blob]
  )
  const mode = chosenMode ?? detectedMode

  // Re-wrap the bytes with a type derived from the chosen viewer, never the
  // stored content type, so nothing is ever interpreted as an HTML document.
  const objectUrl = useMemo(() => {
    if (!blob || mode === null || mode === "text") {
      return null
    }
    return URL.createObjectURL(
      new Blob([blob], { type: blobTypeFor(mode, target.name) })
    )
  }, [blob, mode, target.name])

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    },
    [objectUrl]
  )

  useEffect(() => {
    if (!blob || mode !== "text") {
      return
    }
    let cancelled = false
    void blob
      .slice(0, TEXT_PREVIEW_BYTES)
      .arrayBuffer()
      .then((buffer) => {
        if (cancelled) {
          return
        }
        const bytes = new Uint8Array(buffer)
        setText({
          text: new TextDecoder("utf-8").decode(bytes),
          truncated: blob.size > TEXT_PREVIEW_BYTES,
          binary: looksBinary(bytes),
        })
      })
    return () => {
      cancelled = true
    }
  }, [blob, mode])

  const download = useCallback(async () => {
    setIsDownloading(true)
    try {
      const bytes =
        blob ?? (await fetchObject(datasourceId, target.bucket, target.key))
      saveBlob(bytes, target.name)
    } catch (cause) {
      setError((await errorMessage(cause)) ?? t("detail.preview.downloadError"))
    } finally {
      setIsDownloading(false)
    }
  }, [blob, datasourceId, target.bucket, target.key, target.name, t])

  return {
    status,
    error,
    mode,
    detectedMode,
    setMode: setChosenMode,
    objectUrl,
    text: mode === "text" ? text : null,
    contentType: blob?.type || null,
    size: blob?.size ?? target.size,
    download,
    isDownloading,
  }
}
