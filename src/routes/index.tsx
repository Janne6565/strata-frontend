import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { requireFullAuth } from "@/lib/auth"

export const Route = createFileRoute("/")({
  beforeLoad: () => requireFullAuth(),
  component: IndexPage,
})

function IndexPage() {
  const { t } = useTranslation()
  return (
    <div className="text-foreground p-6">
      <h1 className="font-medium">{t("common.appName")}</h1>
    </div>
  )
}
