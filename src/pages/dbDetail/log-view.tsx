import { useState } from "react"
import { Copy, X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { parseTimestamp } from "@/lib/time"
import { cn } from "@/lib/utils"

type Level = "error" | "warn" | "info" | "debug"

/** Best-effort severity sniff so the eye can scan a log stream by colour. */
function lineLevel(line: string): Level | null {
  const lower = line.toLowerCase()
  if (/\b(error|err|fatal|panic|critical|severe)\b/.test(lower)) {
    return "error"
  }
  if (/\b(warn|warning)\b/.test(lower)) {
    return "warn"
  }
  if (/\b(info|notice)\b/.test(lower)) {
    return "info"
  }
  if (/\b(debug|trace|verbose)\b/.test(lower)) {
    return "debug"
  }
  return null
}

// Left-edge accent per severity; null levels stay neutral.
const LEVEL_ACCENT: Record<Level, string> = {
  error: "border-l-destructive/70",
  warn: "border-l-warning/70",
  info: "border-l-primary/60",
  debug: "border-l-border",
}

interface LogEntry {
  readonly timestamp: unknown
  readonly line: string
  readonly labels: readonly { key: string; value: string }[]
}

/** One label as a compact monospace chip. */
function LabelChip({ name, value }: { readonly name: string; readonly value: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 py-px font-mono text-[10.5px] leading-tight">
      <span className="text-muted-foreground">{name}</span>
      <span className="text-muted-foreground/50">=</span>
      <span className="text-foreground/80">{value}</span>
    </span>
  )
}

/**
 * Loki's stream rendered as a log viewer rather than a spreadsheet: a readable
 * time gutter, the full wrapping log line, and the stream's labels as chips.
 * Rows arrive newest-first from the backend; clicking one expands the full entry.
 */
export function LogView({
  columns,
  rows,
}: {
  readonly columns?: readonly string[]
  readonly rows?: readonly unknown[][]
}) {
  const { t } = useTranslation()
  const cols = columns ?? []
  const data = rows ?? []
  const [expanded, setExpanded] = useState<LogEntry | null>(null)

  const tsIndex = cols.findIndex((c) => c.toLowerCase() === "timestamp")
  const lineIndex = cols.findIndex((c) => c.toLowerCase() === "line")
  const labelIndexes = cols
    .map((_, index) => index)
    .filter((index) => index !== tsIndex && index !== lineIndex)

  function toEntry(row: readonly unknown[]): LogEntry {
    const labels = labelIndexes
      .map((index) => ({
        key: cols[index] ?? "",
        value: row[index] == null ? "" : String(row[index]),
      }))
      .filter((label) => label.value !== "")
    return {
      timestamp: tsIndex >= 0 ? row[tsIndex] : null,
      line: lineIndex >= 0 ? String(row[lineIndex] ?? "") : "",
      labels,
    }
  }

  if (data.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        {t("detail.logs.empty")}
      </p>
    )
  }

  return (
    <>
      <ul className="divide-y divide-border/40">
        {data.map((row, rowIndex) => {
          const entry = toEntry(row)
          const time = parseTimestamp(entry.timestamp)
          const level = lineLevel(entry.line)
          return (
            <li key={rowIndex}>
              <button
                type="button"
                onClick={() => setExpanded(entry)}
                title={t("detail.logs.expand")}
                className={cn(
                  "flex w-full gap-3 border-l-2 border-l-transparent px-3 py-1.5 text-left hover:bg-muted/30",
                  level && LEVEL_ACCENT[level]
                )}
              >
                <span
                  className="shrink-0 pt-px text-right font-mono text-[11px] leading-snug tabular-nums text-muted-foreground"
                  title={time?.raw}
                >
                  <span className="block text-foreground/90">
                    {time ? time.clock : "—"}
                  </span>
                  {time && (
                    <span className="block text-[10px] text-muted-foreground/60">
                      .{time.millis}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs leading-snug break-words whitespace-pre-wrap text-foreground/90">
                    {entry.line}
                  </span>
                  {entry.labels.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {entry.labels.map((label) => (
                        <LabelChip
                          key={label.key}
                          name={label.key}
                          value={label.value}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <DialogPrimitive.Root
        open={expanded !== null}
        onOpenChange={(open) => {
          if (!open) {
            setExpanded(null)
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 flex max-h-[75vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <DialogPrimitive.Title className="font-mono text-xs font-medium text-muted-foreground">
                {parseTimestamp(expanded?.timestamp)?.full ?? t("detail.logs.message")}
              </DialogPrimitive.Title>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    if (expanded) {
                      void navigator.clipboard?.writeText(expanded.line)
                    }
                  }}
                >
                  <Copy />
                  {t("detail.copy")}
                </Button>
                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("search.close")}
                  >
                    <X />
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </div>
            <div className="overflow-auto px-4 py-3">
              <pre className="font-mono text-xs break-words whitespace-pre-wrap text-foreground">
                {expanded?.line}
              </pre>
              {expanded && expanded.labels.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                    {t("detail.logs.labels")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {expanded.labels.map((label) => (
                      <LabelChip
                        key={label.key}
                        name={label.key}
                        value={label.value}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
