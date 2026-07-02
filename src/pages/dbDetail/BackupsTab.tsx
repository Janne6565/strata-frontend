import { Download, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/format"
import { useDatasourceBackupsLogic } from "@/pages/dbDetail/useDatasourceBackupsLogic"

export function BackupsTab({ id }: { readonly id: string }) {
  const { t } = useTranslation()
  const {
    backups,
    status,
    download,
    downloadingName,
    createBackup,
    isCreating,
    errorMessage,
  } = useDatasourceBackupsLogic(id)

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {t("detail.backupsHint")}
        </p>
        <Button
          size="sm"
          disabled={isCreating || downloadingName !== null}
          onClick={() => void createBackup()}
        >
          <Plus />
          {isCreating ? t("detail.creatingBackup") : t("detail.createBackup")}
        </Button>
      </div>

      {errorMessage !== null && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      {status === "loading" && (
        <p className="text-muted-foreground p-8 text-center text-sm">
          {t("common.loading")}
        </p>
      )}
      {status === "failed" && (
        <p className="text-destructive p-8 text-center text-sm">
          {t("detail.backupError")}
        </p>
      )}
      {status === "idle" && backups.length === 0 && (
        <p className="text-muted-foreground p-8 text-center text-sm">
          {t("detail.backupsEmpty")}
        </p>
      )}
      {status === "idle" && backups.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b border-border text-left">
            <tr>
              <th className="px-4 py-2 font-medium">{t("detail.backupName")}</th>
              <th className="px-4 py-2 font-medium">
                {t("detail.backupCreated")}
              </th>
              <th className="px-4 py-2 text-right font-medium">
                {t("detail.backupSize")}
              </th>
              <th className="px-4 py-2 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr
                key={backup.name}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-2.5 font-mono text-xs">{backup.name}</td>
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
                      ? t("detail.downloadingBackup")
                      : t("detail.downloadBackup")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
