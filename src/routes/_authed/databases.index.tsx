import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { InventoryPage } from "@/pages/inventory"
import { useAppDispatch } from "@/store/hooks"
import { setInventoryEngine } from "@/store/uiSlice"

/** `?engine=<driver>` keeps the engine chip selection across reloads and history. */
interface InventorySearch {
  readonly engine?: string
}

export const Route = createFileRoute("/_authed/databases/")({
  validateSearch: (search: Record<string, unknown>): InventorySearch =>
    typeof search.engine === "string" && search.engine !== ""
      ? { engine: search.engine }
      : {},
  component: RouteComponent,
})

function RouteComponent() {
  const { engine } = Route.useSearch()
  const navigate = Route.useNavigate()
  const dispatch = useAppDispatch()

  // Remember the URL's filter so "back to databases" links can restore it.
  useEffect(() => {
    dispatch(setInventoryEngine(engine ?? null))
  }, [dispatch, engine])

  return (
    <InventoryPage
      engine={engine ?? null}
      onEngineChange={(next) => {
        // Replace, not push: a chip click is a view setting, not a navigation step.
        void navigate({
          search: next === null ? {} : { engine: next },
          replace: true,
        })
      }}
    />
  )
}
