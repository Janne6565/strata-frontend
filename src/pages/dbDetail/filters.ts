/** Browse-grid sort + filter model, mirroring the backend's query contract. */

export type SortDirection = "ASC" | "DESC"

export interface SortState {
  readonly column: string
  readonly direction: SortDirection
}

/** Comparison operators, matching the backend `FilterOp` wire tokens. */
export type FilterOp =
  | "eq"
  | "ne"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "like"
  | "isnull"
  | "isnotnull"

export interface ColumnFilter {
  readonly column: string
  readonly op: FilterOp
  readonly value: string
}

/** The null-checks take no value. */
export function opNeedsValue(op: FilterOp): boolean {
  return op !== "isnull" && op !== "isnotnull"
}

/**
 * Serializes a filter to the backend's `column:op:value` form. `like` is wrapped
 * in `%…%` so the value reads as a "contains" match; the value-less null checks
 * drop the trailing segment.
 */
export function toWireFilter(filter: ColumnFilter): string {
  if (!opNeedsValue(filter.op)) {
    return `${filter.column}:${filter.op}`
  }
  const value = filter.op === "like" ? `%${filter.value}%` : filter.value
  return `${filter.column}:${filter.op}:${value}`
}
