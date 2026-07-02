import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { downloadBackup, listBackups } from "@/api/backups"
import { useDataInteractions } from "@/api/useDataInteractions"
import { useDataLoading } from "@/api/useDataLoading"

/** Streams a fetched Blob to the browser as a file download, then releases the URL. */
function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useBackupsLogic() {
  const { t } = useTranslation()
  const { data, status } = useDataLoading(listBackups)
  const { run, errorMessage, clearError } = useDataInteractions()
  const [downloadingName, setDownloadingName] = useState<string | null>(null)

  const download = useCallback(
    (name: string) =>
      run(async () => {
        setDownloadingName(name)
        try {
          saveBlob(await downloadBackup(name), name)
        } finally {
          setDownloadingName(null)
        }
      }, t("backups.error.download")),
    [run, t]
  )

  return {
    backups: data ?? [],
    status,
    download,
    downloadingName,
    errorMessage,
    clearError,
  }
}
