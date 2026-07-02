import { Link, useLocation } from "@tanstack/react-router"
import type { ParseKeys } from "i18next"
import {
  Database,
  HardDriveDownload,
  KeyRound,
  Layers,
  LogOut,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { BrandMark } from "@/components/BrandMark"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { cn } from "@/lib/utils"

interface NavItem {
  readonly to: string
  readonly labelKey: ParseKeys
  readonly icon: LucideIcon
  readonly adminOnly?: boolean
  readonly ownerOnly?: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: "/databases", labelKey: "nav.databases", icon: Database },
  { to: "/groups", labelKey: "nav.groups", icon: Layers },
  { to: "/admin/users", labelKey: "nav.users", icon: Users, adminOnly: true },
  { to: "/admin/grants", labelKey: "nav.grants", icon: KeyRound, adminOnly: true },
  {
    to: "/admin/backups",
    labelKey: "nav.backups",
    icon: HardDriveDownload,
    ownerOnly: true,
  },
]

const ITEM = "flex size-[38px] items-center justify-center rounded-[10px] transition-colors"

export function AppSidebar() {
  const { t } = useTranslation()
  const { username, isAdmin, isOwner, logout } = useAuthInformation()
  const { pathname } = useLocation()
  const initials = (username ?? "?").slice(0, 2).toUpperCase()
  const items = NAV_ITEMS.filter(
    (item) =>
      (!item.adminOnly || isAdmin) && (!item.ownerOnly || isOwner)
  )

  return (
    <aside className="flex w-[58px] shrink-0 flex-col items-center gap-1.5 border-r border-sidebar-border bg-sidebar py-3.5">
      <BrandMark size={30} className="mb-2" />

      {items.map((item) => {
        const Icon = item.icon
        const active =
          pathname === item.to || pathname.startsWith(`${item.to}/`)
        return (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>
              <Link
                to={item.to}
                aria-label={t(item.labelKey)}
                className={cn(
                  ITEM,
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-[18px]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
          </Tooltip>
        )
      })}

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t("common.signOut")}
            onClick={logout}
            className={cn(
              ITEM,
              "text-sidebar-foreground/45 hover:bg-white/5 hover:text-sidebar-foreground"
            )}
          >
            <LogOut className="size-[18px]" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{t("common.signOut")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mt-1 flex size-[30px] items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[#3a3d46] to-[#23252b] text-[11px] font-semibold text-[#c3c6cd]">
            {initials}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{username ?? ""}</TooltipContent>
      </Tooltip>
    </aside>
  )
}
