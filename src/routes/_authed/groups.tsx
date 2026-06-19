import { createFileRoute } from "@tanstack/react-router"

import { GroupsPage } from "@/pages/groups"

export const Route = createFileRoute("/_authed/groups")({
  component: GroupsPage,
})
