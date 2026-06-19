import { createFileRoute, redirect } from "@tanstack/react-router"

import { isAuthenticated } from "@/lib/auth"
import { LoginPage } from "@/pages/login"

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    // Already signed in → skip the form.
    if (isAuthenticated()) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})
