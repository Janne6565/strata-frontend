import axios from "axios"

/**
 * Pulls the human-readable message out of an RFC 7807 ProblemDetail body the
 * backend returns on error (see ExceptionController). Returns null when the
 * error isn't a recognizable API error, so callers can fall back to a
 * translated generic message.
 */
export function extractProblemDetail(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  const data = error.response?.data
  if (data && typeof data === "object") {
    const detail = (data as { detail?: unknown }).detail
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail
    }
  }

  return null
}
