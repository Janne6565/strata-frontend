import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { isAuthenticated } from "@/lib/auth"
import { LoginPage } from "@/pages/login"

// The backend's OAuth callback redirects here with `?oauthError=noAccess` (no
// strata-* group) or `?oauthError=true` (any other failure). TanStack's default
// search parser JSON-decodes values, so `true` arrives as a boolean.
const loginSearchSchema = z.object({
  oauthError: z.union([z.literal("noAccess"), z.boolean()]).optional(),
})

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    // Already signed in → skip the form.
    if (isAuthenticated()) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})
