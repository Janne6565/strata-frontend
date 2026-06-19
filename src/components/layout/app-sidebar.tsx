import { Link } from "@tanstack/react-router"
import type { ParseKeys } from "i18next"
import { Database, KeyRound, Layers, LogOut, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { cn } from "@/lib/utils"

interface NavItem {
  readonly to?: string
  readonly labelKey: ParseKeys
  readonly icon: LucideIcon
  readonly adminOnly?: boolean
}

// `to` omitted → the screen isn't built yet; rendered disabled so the planned
// information architecture is visible without dead links.
const NAV_ITEMS: readonly NavItem[] = [
  { to: "/databases", labelKey: "nav.databases", icon: Database },
  { labelKey: "nav.groups", icon: Layers },
  { to: "/admin/users", labelKey: "nav.users", icon: Users, adminOnly: true },
  { labelKey: "nav.grants", icon: KeyRound, adminOnly: true },
]

export function AppSidebar() {
  const { t } = useTranslation()
  const { username, role, isAdmin, logout } = useAuthInformation()

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex w-60 shrink-0 flex-col border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="bg-primary size-6 rounded-md" aria-hidden />
        <span className="text-sidebar-foreground font-semibold tracking-tight">
          {t("common.appName")}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const content = (
            <>
              <Icon className="size-4" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {item.to === undefined && (
                <Badge variant="outline" className="text-[10px]">
                  {t("nav.soon")}
                </Badge>
              )}
            </>
          )
          const base =
            "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium"

          return item.to !== undefined ? (
            <Link
              key={item.labelKey}
              to={item.to}
              className={cn(
                base,
                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              activeProps={{
                className: cn(
                  base,
                  "bg-sidebar-accent text-sidebar-accent-foreground"
                ),
              }}
            >
              {content}
            </Link>
          ) : (
            <span
              key={item.labelKey}
              aria-disabled
              className={cn(base, "text-sidebar-foreground/35")}
            >
              {content}
            </span>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="truncate text-sm font-medium">{username}</span>
          {role !== null && (
            <Badge variant="secondary" className="shrink-0">
              {role}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="justify-start" onClick={logout}>
          <LogOut className="size-4" />
          {t("common.signOut")}
        </Button>
      </div>
    </aside>
  )
}
