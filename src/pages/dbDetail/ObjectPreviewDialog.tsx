import { Download, X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useState } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { PREVIEW_MODES } from "@/lib/filePreview"
import type { PreviewMode } from "@/lib/filePreview"
import { formatBytes } from "@/lib/metrics"
import { cn } from "@/lib/utils"
import { useObjectPreviewLogic } from "@/pages/dbDetail/useObjectPreviewLogic"
import type { PreviewTarget } from "@/pages/dbDetail/useObjectPreviewLogic"

type Preview = ReturnType<typeof useObjectPreviewLogic>

/** Modal preview of one MinIO object, with a mode picker and a download button. */
export function ObjectPreviewDialog({
  datasourceId,
  target,
  onClose,
}: {
  readonly datasourceId: string
  readonly target: PreviewTarget | null
  readonly onClose: () => void
}) {
  return (
    <DialogPrimitive.Root
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 flex h-[85vh] w-[92vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Keyed so a new file starts from a fresh fetch and mode. */}
          {target && (
            <PreviewBody
              key={`${target.bucket}/${target.key}`}
              datasourceId={datasourceId}
              target={target}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function PreviewBody({
  datasourceId,
  target,
}: {
  readonly datasourceId: string
  readonly target: PreviewTarget
}) {
  const { t } = useTranslation()
  const preview = useObjectPreviewLogic(datasourceId, target)
  const meta = [
    preview.size == null ? null : formatBytes(preview.size),
    preview.contentType,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <DialogPrimitive.Title className="truncate font-mono text-sm font-medium text-foreground">
            {target.name}
          </DialogPrimitive.Title>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {target.bucket}/{target.key}
            {meta && ` · ${meta}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {preview.status === "ready" && (
            <ModePicker
              value={preview.mode}
              detected={preview.detectedMode}
              onChange={preview.setMode}
            />
          )}
          <Button
            variant="outline"
            size="xs"
            onClick={() => void preview.download()}
            disabled={preview.isDownloading}
          >
            <Download />
            {preview.isDownloading
              ? t("detail.downloadingBackup")
              : t("detail.downloadBackup")}
          </Button>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("detail.preview.close")}
            >
              <X />
            </Button>
          </DialogPrimitive.Close>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-black/20">
        <PreviewContent preview={preview} name={target.name} />
      </div>
    </>
  )
}

function ModePicker({
  value,
  detected,
  onChange,
}: {
  readonly value: PreviewMode | null
  readonly detected: PreviewMode | null
  readonly onChange: (mode: PreviewMode) => void
}) {
  const { t } = useTranslation()
  return (
    <div
      role="radiogroup"
      aria-label={t("detail.preview.mode")}
      className="flex rounded-md border border-border p-0.5"
    >
      {PREVIEW_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          title={mode === detected ? t("detail.preview.detected") : undefined}
          className={cn(
            "rounded px-2 py-0.5 text-[11.5px]",
            value === mode
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t(`detail.preview.modes.${mode}`)}
        </button>
      ))}
    </div>
  )
}

function Centered({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

function PreviewContent({
  preview,
  name,
}: {
  readonly preview: Preview
  readonly name: string
}) {
  const { t } = useTranslation()

  if (preview.status === "tooLarge") {
    return <Centered>{t("detail.preview.tooLarge")}</Centered>
  }
  if (preview.status === "loading") {
    return <Centered>{t("common.loading")}</Centered>
  }
  if (preview.status === "failed") {
    return (
      <Centered>
        <span className="text-destructive">{preview.error}</span>
      </Centered>
    )
  }
  if (preview.mode === null) {
    return (
      <Centered>
        <p className="font-medium text-foreground">
          {t("detail.preview.unknownTitle")}
        </p>
        <p>{t("detail.preview.unknownHint")}</p>
      </Centered>
    )
  }
  if (preview.mode === "text") {
    if (!preview.text) {
      return <Centered>{t("common.loading")}</Centered>
    }
    return (
      <div className="flex flex-col">
        {(preview.text.binary || preview.text.truncated) && (
          <p className="border-b border-border px-4 py-1.5 text-xs text-[#e5a53b]">
            {preview.text.binary
              ? t("detail.preview.binaryWarning")
              : t("detail.preview.truncated")}
          </p>
        )}
        <pre className="p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-foreground">
          {preview.text.text}
        </pre>
      </div>
    )
  }
  if (!preview.objectUrl) {
    return <Centered>{t("common.loading")}</Centered>
  }
  // Keyed by mode so a decode failure in one viewer doesn't stick to the next.
  return (
    <MediaPreview
      key={preview.mode}
      mode={preview.mode}
      objectUrl={preview.objectUrl}
      name={name}
    />
  )
}

/** Image/video/audio/PDF viewer; reports when the bytes don't decode as the chosen mode. */
function MediaPreview({
  mode,
  objectUrl,
  name,
}: {
  readonly mode: Exclude<PreviewMode, "text">
  readonly objectUrl: string
  readonly name: string
}) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const onError = () => setFailed(true)

  if (failed) {
    return (
      <Centered>
        {t("detail.preview.decodeError", {
          mode: t(`detail.preview.modes.${mode}`),
        })}
      </Centered>
    )
  }
  switch (mode) {
    case "image":
      return (
        <div className="flex min-h-full items-center justify-center p-4">
          <img
            src={objectUrl}
            alt={name}
            onError={onError}
            className="max-h-[75vh] max-w-full object-contain"
          />
        </div>
      )
    case "video":
      return (
        <div className="flex min-h-full items-center justify-center p-4">
          <video
            src={objectUrl}
            controls
            onError={onError}
            className="max-h-[75vh] max-w-full"
          />
        </div>
      )
    case "audio":
      return (
        <Centered>
          <audio
            src={objectUrl}
            controls
            onError={onError}
            className="w-full max-w-lg"
          />
        </Centered>
      )
    case "pdf":
      return (
        <iframe
          src={objectUrl}
          title={t("detail.preview.modes.pdf")}
          className="h-full w-full border-0 bg-white"
        />
      )
  }
}
