import { createFileRoute, redirect } from "@tanstack/react-router"

// Landing route: send signed-in users to the primary screen.
export const Route = createFileRoute("/_authed/")({
  beforeLoad: () => {
    throw redirect({ to: "/databases" })
  },
})
