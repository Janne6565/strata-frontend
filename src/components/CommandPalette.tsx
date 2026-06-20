import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui"
import { CornerDownLeft, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { useCommandPaletteLogic } from "@/components/useCommandPaletteLogic"
import { engineStyle, engineTint } from "@/lib/engine"
import { cn } from "@/lib/utils"

function label(datasource: DatasourceResponse): string {
  return (
    datasource.displayName ??
    datasource.workloadName ??
    datasource.discoveryKey ??
    datasource.id ??
    "—"
  )
}

interface KeyHintProps {
  readonly keys: string
  readonly label: string
}

function KeyHint({ keys, label }: KeyHintProps) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-px font-mono text-[10px] text-[#c4c7cd]">
        {keys}
      </kbd>
      {label}
    </span>
  )
}

/**
 * Centered command palette for jumping straight to a database. Opens from the
 * top-bar search button or ⌘K / Ctrl+K, filters the cached catalog as you type,
 * and supports arrow-key navigation with Enter to open the highlighted result.
 */
interface CommandPaletteProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation()
  const {
    query,
    active,
    setActive,
    results,
    inputRef,
    listRef,
    select,
    onInputKeyDown,
    handleQueryChange,
    handleOpenAutoFocus,
  } = useCommandPaletteLogic(open, onOpenChange)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
          className="fixed top-[14vh] left-1/2 z-50 w-full max-w-[560px] -translate-x-1/2 px-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>{t("search.open")}</DialogPrimitive.Title>
          </VisuallyHidden.Root>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2.5 border-b border-border/60 px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={t("search.placeholder")}
                aria-label={t("search.open")}
                className="h-12 min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-px font-mono text-[10px] text-muted-foreground">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <div className="px-3 py-10 text-center text-[13px] text-muted-foreground">
                  {t("search.empty")}
                </div>
              ) : (
                results.map((datasource, index) => {
                  const engine = engineStyle(datasource.driver)
                  const isActive = index === active
                  return (
                    <button
                      key={datasource.id ?? datasource.discoveryKey}
                      type="button"
                      data-index={index}
                      onMouseMove={() => setActive(index)}
                      onClick={() => select(datasource)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        isActive ? "bg-white/[0.055]" : "hover:bg-white/[0.025]"
                      )}
                    >
                      <span
                        className="flex size-[28px] shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold"
                        style={engineTint(datasource.driver)}
                      >
                        {engine.short}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-foreground">
                          {label(datasource)}
                        </div>
                        <div className="truncate font-mono text-[11px] text-muted-foreground">
                          {datasource.driver ?? "—"}
                          {datasource.namespace
                            ? ` · ${datasource.namespace}`
                            : ""}
                        </div>
                      </div>
                      {isActive && (
                        <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex items-center gap-3.5 border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
              <KeyHint keys="↑↓" label={t("search.navigate")} />
              <KeyHint keys="↵" label={t("search.select")} />
              <KeyHint keys="esc" label={t("search.close")} />
              <span className="ml-auto font-mono text-[10.5px]">
                {t("search.count", { count: results.length })}
              </span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
