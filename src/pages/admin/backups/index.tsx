import { Download } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/format"
import { useBackupsLogic } from "@/pages/admin/backups/useBackupsLogic"

export function BackupsPage() {
  const { t } = useTranslation()
  const { backups, status, download, downloadingName, errorMessage } =
    useBackupsLogic()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{t("backups.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("backups.subtitle")}</p>
      </div>

      {errorMessage !== null && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card">
        {status === "loading" && (
          <p className="text-muted-foreground p-8 text-center text-sm">
            {t("common.loading")}
          </p>
        )}
        {status === "failed" && (
          <p className="text-destructive p-8 text-center text-sm">
            {t("backups.error.load")}
          </p>
        )}
        {status === "idle" && backups.length === 0 && (
          <p className="text-muted-foreground p-8 text-center text-sm">
            {t("backups.empty")}
          </p>
        )}
        {status === "idle" && backups.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b border-border text-left">
              <tr>
                <th className="px-4 py-2 font-medium">
                  {t("backups.col.name")}
                </th>
                <th className="px-4 py-2 font-medium">
                  {t("backups.col.created")}
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  {t("backups.col.size")}
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  {t("backups.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr
                  key={backup.name}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {backup.name}
                  </td>
                  <td className="px-4 py-2.5">
                    {new Date(backup.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatBytes(backup.sizeBytes)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      disabled={downloadingName !== null}
                      onClick={() => void download(backup.name)}
                    >
                      <Download />
                      {downloadingName === backup.name
                        ? t("backups.downloading")
                        : t("backups.download")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
