import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  // Placeholder — the real login form arrives in M1 (auth vertical slice).
  return (
    <div className="text-foreground p-6">
      <h1 className="font-medium">{t("login.title")}</h1>
    </div>
  )
}
