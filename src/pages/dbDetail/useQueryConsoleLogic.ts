import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { runExecute, runQuery } from "@/api/generated/browse/browse"
import type { QueryResult } from "@/api/generated/model"
import { extractProblemDetail } from "@/lib/errors"

type Status = "empty" | "loading" | "idle" | "failed"

/**
 * Runs ad-hoc queries against a datasource. "read" goes through the read-only
 * path; "write" through execute. The backend enforces read-only / prod
 * safe-mode and returns a ProblemDetail, which we surface verbatim.
 */
export function useQueryConsoleLogic(id: string) {
  const { t } = useTranslation()
  const [sql, setSql] = useState("")
  const [result, setResult] = useState<QueryResult | null>(null)
  const [status, setStatus] = useState<Status>("empty")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const submit = useCallback(
    async (mode: "read" | "write") => {
      if (sql.trim() === "") {
        return
      }
      setStatus("loading")
      setErrorMessage(null)
      setResult(null)
      try {
        const call = mode === "read" ? runQuery : runExecute
        setResult(await call(id, { sql }))
        setStatus("idle")
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("detail.queryError"))
        setStatus("failed")
      }
    },
    [id, sql, t]
  )

  return {
    sql,
    setSql,
    result,
    status,
    errorMessage,
    isRunning: status === "loading",
    run: useCallback(() => submit("read"), [submit]),
    execute: useCallback(() => submit("write"), [submit]),
  }
}
