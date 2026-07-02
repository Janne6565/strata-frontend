import { customInstance } from "@/api/axios-instance"

/** Metadata for a stored database backup (mirrors the backend BackupResponse). */
export interface BackupResponse {
  readonly name: string
  readonly sizeBytes: number
  readonly createdAt: string
}

/** Lists available backups, newest first. OWNER-only on the backend. */
export function listBackups(): Promise<BackupResponse[]> {
  return customInstance<BackupResponse[]>({
    url: `/api/v1/backups`,
    method: "GET",
  })
}

/** Fetches a backup's bytes as a Blob (auth header injected by the axios interceptor). */
export function downloadBackup(name: string): Promise<Blob> {
  return customInstance<Blob>({
    url: `/api/v1/backups/${encodeURIComponent(name)}/download`,
    method: "GET",
    responseType: "blob",
  })
}
