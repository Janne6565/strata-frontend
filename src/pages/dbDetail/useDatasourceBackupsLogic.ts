import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import {
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
  const { data, status } = useDataLoading(loader)
  const { run, errorMessage } = useDataInteractions()
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

  return {
    backups: data ?? [],
    status,
    download,
    downloadingName,
    errorMessage,
  }
}
