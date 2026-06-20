import { customInstance } from "@/api/axios-instance"
import type { DatasourceResponse } from "@/api/generated/model"

/**
 * Renames a datasource (sets its human-friendly display name). Hand-written for
 * now; once the backend is running, `bun run gen:api` emits an equivalent
 * `rename` under api/generated/inventory that this can be swapped to.
 */
export function renameDatasource(
  id: string,
  displayName: string
): Promise<DatasourceResponse> {
  return customInstance<DatasourceResponse>({
    url: `/api/v1/datasources/${id}`,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    data: { displayName },
  })
}
