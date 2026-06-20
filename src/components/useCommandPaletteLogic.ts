import type { KeyboardEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { DatasourceResponse } from "@/api/generated/model"
import { useDatasources } from "@/store/entityHooks"

/**
 * State + behaviour for the command palette: filters the cached catalog against
 * the query, owns keyboard navigation (arrows + Enter) and the global ⌘K / Ctrl+K
 * toggle, and resolves a selection to a navigation. The component stays render-only.
 */
export function useCommandPaletteLogic(
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
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
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    globalThis.addEventListener("keydown", onKey)
    return () => globalThis.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  // Keep the highlighted row scrolled into view as the selection moves.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active])

  const select = useCallback(
    (datasource: DatasourceResponse | undefined) => {
      if (!datasource) {
        return
      }
      onOpenChange(false)
      void navigate({ to: "/databases/$id", params: { id: datasource.id ?? "" } })
    },
    [navigate, onOpenChange]
  )

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
    },
    [results, active, select]
  )

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setActive(0)
  }, [])

  // Radix fires this on open; reset the query and focus the input ourselves.
  const handleOpenAutoFocus = useCallback((event: Event) => {
    event.preventDefault()
    setQuery("")
    setActive(0)
    inputRef.current?.focus()
  }, [])

  return {
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
  }
}
