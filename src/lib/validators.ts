/**
 * Central field-validation rules. Framework-agnostic (no React imports) so the
 * same predicates back both form-disable state and any future submit-time
 * checks. Components and hooks must drive validation from here rather than
 * inlining trimmed-length / scope checks.
 */

/** Minimum length the backend enforces for a new user's password. */
export const PASSWORD_MIN = 8

/** True when a required free-text field has non-whitespace content. */
export function isNonBlank(value: string): boolean {
  return value.trim().length > 0
}

/** True when a new password meets the minimum-length policy. */
export function meetsPasswordPolicy(value: string): boolean {
  return value.length >= PASSWORD_MIN
}

/**
 * A grant needs a namespace for NAMESPACE scope, or a datasource for DATABASE
 * scope. Kept as plain string params so `lib` stays free of generated enums.
 */
export function isGrantScopeValid(
  scopeType: string,
  namespace: string,
  datasourceId: string
): boolean {
  return scopeType === "NAMESPACE" ? isNonBlank(namespace) : datasourceId !== ""
}
