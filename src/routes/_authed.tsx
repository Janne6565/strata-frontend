import { createFileRoute } from "@tanstack/react-router"

import { AppShell } from "@/components/layout/AppShell"
import { requireFullAuth } from "@/lib/auth"

// Pathless layout: guards every child route and wraps them in the app shell.
export const Route = createFileRoute("/_authed")({
  beforeLoad: () => requireFullAuth(),
  component: AppShell,
})
