import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui"
import { CornerDownLeft, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { DatasourceResponse } from "@/api/generated/model"
import { engineStyle, engineTint } from "@/lib/engine"
import { useDatasources } from "@/store/entityHooks"
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

function KeyHint({
  keys,
  label,
}: {
  readonly keys: string
  readonly label: string
}) {
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
export function CommandPalette({
  open,
  onOpenChange,
}: {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { datasources } = useDatasources()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === "") {
      return datasources
    }
    return datasources.filter((datasource) =>
      [
        datasource.displayName,
        datasource.driver,
        datasource.namespace,
        datasource.workloadName,
        datasource.discoveryKey,
      ].some((field) => field?.toLowerCase().includes(q))
    )
  }, [datasources, query])

  // Global ⌘K / Ctrl+K toggles the palette from anywhere in the app.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  // Keep the highlighted row scrolled into view as the selection moves.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  function select(datasource: DatasourceResponse | undefined) {
    if (!datasource) {
      return
    }
    onOpenChange(false)
    void navigate({ to: "/databases/$id", params: { id: datasource.id ?? "" } })
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      select(results[active])
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            setQuery("")
            setActive(0)
            inputRef.current?.focus()
          }}
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
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
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
