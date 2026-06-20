import * as React from "react"
import { useState } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Prompts for a group name before creating it. `onCreate` resolves to `true` on
 * success (the dialog closes) or `false` on failure (it stays open so the user
 * can retry; the page surfaces the error message).
 */
export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onCreate: (name: string) => Promise<boolean>
}) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed === "" || submitting) {
      return
    }
    setSubmitting(true)
    const ok = await onCreate(trimmed)
    setSubmitting(false)
    if (ok) {
      onOpenChange(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={() => setName("")}
          className="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card px-6 pt-6 pb-5 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-md"
        >
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <DialogPrimitive.Title className="text-base font-semibold">
                {t("groups.createTitle")}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {t("groups.createDescription")}
              </DialogPrimitive.Description>
            </div>

            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("groups.namePlaceholder")}
              aria-label={t("groups.namePlaceholder")}
              maxLength={60}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={name.trim() === "" || submitting}
              >
                {t("groups.createSubmit")}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
