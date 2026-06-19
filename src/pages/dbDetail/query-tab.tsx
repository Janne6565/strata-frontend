import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ResultGrid } from "@/pages/dbDetail/result-grid"
import { useQueryConsoleLogic } from "@/pages/dbDetail/useQueryConsoleLogic"

export function QueryTab({ id }: { readonly id: string }) {
  const { t } = useTranslation()
  const query = useQueryConsoleLogic(id)
  const isEmpty = query.sql.trim() === ""

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={query.sql}
        onChange={(event) => query.setSql(event.target.value)}
        placeholder={t("detail.queryPlaceholder")}
        spellCheck={false}
        className="min-h-28 font-mono"
        aria-invalid={query.status === "failed"}
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={query.run}
          disabled={query.isRunning || isEmpty}
        >
          {query.isRunning ? t("detail.running") : t("detail.run")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={query.execute}
          disabled={query.isRunning || isEmpty}
        >
          {t("detail.execute")}
        </Button>
        <span className="text-muted-foreground text-xs">
          {t("detail.writeHint")}
        </span>
      </div>

      {query.status === "failed" && (
        <p className="text-destructive text-sm" role="alert">
          {query.errorMessage}
        </p>
      )}

      {query.status === "idle" && query.result && (
        <div className="rounded-xl border border-border bg-card">
          {query.result.updateCount !== undefined &&
          query.result.updateCount !== null ? (
            <p className="text-muted-foreground p-4 text-sm">
              {t("detail.rowsAffected", { count: query.result.updateCount })}
            </p>
          ) : (
            <ResultGrid
              columns={query.result.columns}
              rows={query.result.rows}
            />
          )}
        </div>
      )}
    </div>
  )
}
