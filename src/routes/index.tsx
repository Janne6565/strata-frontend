import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { requireFullAuth } from "@/lib/auth"

export const Route = createFileRoute("/")({
  beforeLoad: () => requireFullAuth(),
  component: IndexPage,
})

function IndexPage() {
  const { t } = useTranslation()
  const { username, role, logout } = useAuthInformation()

  return (
    <div className="text-foreground flex min-h-screen flex-col p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-medium">{t("common.appName")}</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          {t("common.signOut")}
        </Button>
      </header>

      <main className="text-muted-foreground mt-8 text-sm">
        <p>{t("home.signedInAs", { username: username ?? "—" })}</p>
        {role !== null && (
          <p className="mt-1">
            {t("home.role")}: <span className="text-foreground">{role}</span>
          </p>
        )}
      </main>
    </div>
  )
}
