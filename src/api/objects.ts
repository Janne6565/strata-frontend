import { customInstance } from "@/api/axios-instance"

/**
 * Fetches one object's bytes from an object-storage datasource (MinIO) as a
 * Blob. Needs browse access to the datasource; the read is audited.
 */
export function fetchObject(
  datasourceId: string,
  bucket: string,
  key: string
): Promise<Blob> {
  return customInstance<Blob>({
    url: `/api/v1/datasources/${encodeURIComponent(datasourceId)}/objects/${encodeURIComponent(bucket)}/content`,
    method: "GET",
    params: { key },
    responseType: "blob",
  })
}
