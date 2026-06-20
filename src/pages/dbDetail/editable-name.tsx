import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * The datasource title, with admin-only inline rename. Click the pencil to edit;
 * Enter or the check saves, Escape or the cross cancels. A no-op edit (blank or
 * unchanged) just closes without a request.
 */
export function EditableName({
  value,
  canEdit,
  isSaving,
  onSave,
}: {
  readonly value: string
  readonly canEdit: boolean
  readonly isSaving: boolean
  readonly onSave: (name: string) => Promise<boolean>
}) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-[20px] font-semibold tracking-tight">{value}</h1>
        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t("detail.rename")}
                onClick={() => {
                  setDraft(value)
                  setEditing(true)
                }}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <Pencil className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t("detail.rename")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  const submit = async () => {
    const next = draft.trim()
    if (next === "" || next === value) {
      setEditing(false)
      return
    }
    if (await onSave(next)) {
      setEditing(false)
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Input
        autoFocus
        value={draft}
        disabled={isSaving}
        aria-label={t("detail.rename")}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            void submit()
          } else if (event.key === "Escape") {
            setEditing(false)
          }
        }}
        className="h-9 max-w-xs text-[16px] font-semibold"
      />
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={isSaving}
        aria-label={t("common.confirm")}
        onClick={() => void submit()}
      >
        <Check className="size-4" />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={isSaving}
        aria-label={t("common.cancel")}
        onClick={() => setEditing(false)}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
