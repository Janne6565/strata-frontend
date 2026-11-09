/**
 * Folder navigation for object-storage engines (MinIO). The backend lists one
 * folder level per browse call; the folder is picked with a `prefix` filter
 * (`prefix:eq:photos/2024/`), so the row browser's filter state doubles as the
 * current path.
 */
import type { ColumnFilter } from "@/pages/dbDetail/filters"

/** The browse filter column the MinIO engine reads the folder prefix from. */
export const PREFIX_FILTER = "prefix"

export interface Crumb {
  /** Segment label; the bucket name for the root crumb. */
  readonly label: string
  /** The prefix to list when the crumb is clicked ("" = bucket root). */
  readonly prefix: string
}

/** The current folder prefix encoded in the browse filters ("" = bucket root). */
export function currentPrefix(filters: readonly ColumnFilter[]): string {
  return filters.find((filter) => filter.column === PREFIX_FILTER)?.value ?? ""
}

/** The filter list that lists `prefix` (empty at the bucket root). */
export function prefixFilters(prefix: string): readonly ColumnFilter[] {
  return prefix === ""
    ? []
    : [{ column: PREFIX_FILTER, op: "eq", value: prefix }]
}

/** Breadcrumbs from the bucket root down to `prefix`, e.g. photos › 2024 › raw. */
export function breadcrumbs(bucket: string, prefix: string): readonly Crumb[] {
  const crumbs: Crumb[] = [{ label: bucket, prefix: "" }]
  let path = ""
  for (const segment of prefix.split("/")) {
    if (segment === "") {
      continue
    }
    path += `${segment}/`
    crumbs.push({ label: segment, prefix: path })
  }
  return crumbs
}

/** The parent folder of `prefix` ("photos/2024/" → "photos/"). */
export function parentPrefix(prefix: string): string {
  const trimmed = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix
  const slash = trimmed.lastIndexOf("/")
  return slash < 0 ? "" : trimmed.slice(0, slash + 1)
}
