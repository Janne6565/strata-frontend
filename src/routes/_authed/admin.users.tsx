import { createFileRoute } from "@tanstack/react-router"

import { requireAdmin } from "@/lib/auth"
import { UsersPage } from "@/pages/admin/users"

export const Route = createFileRoute("/_authed/admin/users")({
  beforeLoad: () => requireAdmin(),
  component: UsersPage,
})
