import { createFileRoute } from "@tanstack/react-router"

import { requireFullAuth } from "@/lib/auth"

export const Route = createFileRoute("/")({
  beforeLoad: () => requireFullAuth(),
  component: IndexPage,
})

function IndexPage() {
  return (
    <div className="text-foreground p-6">
      <h1 className="font-medium">Strata</h1>
    </div>
  )
}
