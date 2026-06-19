import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  // Placeholder — the real login form arrives in M1 (auth vertical slice).
  return (
    <div className="text-foreground p-6">
      <h1 className="font-medium">Sign in to Strata</h1>
    </div>
  )
}
