import { createFileRoute } from "@tanstack/react-router"

import { DatasourceDetailPage } from "@/pages/dbDetail"

const TABS = ["overview", "browse", "query", "backups"] as const
export type DetailTab = (typeof TABS)[number]

function isDetailTab(value: unknown): value is DetailTab {
  return TABS.includes(value as DetailTab)
}

export const Route = createFileRoute("/_authed/databases/$id")({
  // Persist the active tab in the URL so a reload (or shared link) keeps it.
  validateSearch: (search: Record<string, unknown>): { tab: DetailTab } => ({
    tab: isDetailTab(search.tab) ? search.tab : "overview",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <DatasourceDetailPage
      id={id}
      tab={tab}
      onTabChange={(next) => {
        if (isDetailTab(next)) {
          void navigate({ search: { tab: next }, replace: true })
        }
      }}
    />
  )
}
