import { Outlet } from "@tanstack/react-router"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppTopbar } from "@/components/layout/AppTopbar"

/** Authenticated app frame: persistent sidebar + top bar around the routed page. */
export function AppShell() {
  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
