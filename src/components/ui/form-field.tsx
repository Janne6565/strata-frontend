import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  /** Visible field label, associated with the control via `htmlFor`/`id`. */
  readonly label: string
  /** `id` of the control rendered as `children`. */
  readonly htmlFor: string
  /** Optional helper text shown beneath the control. */
  readonly hint?: string
  /** Validation/error message; rendered as an alert when present. */
  readonly error?: string | null
  readonly className?: string
  /** The form control (Input, Select, …). */
  readonly children: ReactNode
}

/**
 * Shared wrapper for a labelled form control. All forms compose inputs through
 * this rather than pairing raw `<Label>` + control, so label association, hint,
 * and error rendering stay consistent across screens.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
