import { createFileRoute } from "@tanstack/react-router"

import { requireOwner } from "@/lib/auth"
import { BackupsPage } from "@/pages/admin/backups"

export const Route = createFileRoute("/_authed/admin/backups")({
  beforeLoad: () => requireOwner(),
  component: BackupsPage,
})
