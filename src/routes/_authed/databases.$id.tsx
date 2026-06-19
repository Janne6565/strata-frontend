import { createFileRoute } from "@tanstack/react-router"

import { DatasourceDetailPage } from "@/pages/dbDetail"

export const Route = createFileRoute("/_authed/databases/$id")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <DatasourceDetailPage id={id} />
}
