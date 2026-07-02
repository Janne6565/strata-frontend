import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  createDatasourceBackup,
  downloadDatasourceBackup,
  listBackupsForDatasource,
} from "@/api/backups"
import { useDataInteractions } from "@/api/useDataInteractions"
import { useDataLoading } from "@/api/useDataLoading"
import { saveBlob } from "@/lib/download"

export function useDatasourceBackupsLogic(datasourceId: string) {
  const { t } = useTranslation()
  const loader = useCallback(
    () => listBackupsForDatasource(datasourceId),
    [datasourceId]
  )
  const { data, status, reload } = useDataLoading(loader)
  const { run, status: actionStatus, errorMessage } = useDataInteractions()
  const [downloadingName, setDownloadingName] = useState<string | null>(null)

  const download = useCallback(
    (name: string) =>
      run(async () => {
        setDownloadingName(name)
        try {
          saveBlob(await downloadDatasourceBackup(datasourceId, name), name)
        } finally {
          setDownloadingName(null)
        }
      }, t("detail.backupError")),
    [run, t, datasourceId]
  )

  const createBackup = useCallback(
    () =>
      run(async () => {
        await createDatasourceBackup(datasourceId)
        reload()
      }, t("detail.backupCreateError")),
    [run, reload, t, datasourceId]
  )

  return {
    backups: data ?? [],
    status,
    download,
    downloadingName,
    createBackup,
    isCreating: actionStatus === "loading" && downloadingName === null,
    errorMessage,
  }
}
