import { createFileRoute } from "@tanstack/react-router"

import { requireAdmin } from "@/lib/auth"
import { GrantsPage } from "@/pages/admin/grants"

export const Route = createFileRoute("/_authed/admin/grants")({
  beforeLoad: () => requireAdmin(),
  component: GrantsPage,
})
