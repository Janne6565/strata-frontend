import { useState } from "react"
import { useTranslation } from "react-i18next"

import type { GrantResponse } from "@/api/generated/model"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function scopeTarget(grant: GrantResponse): string {
  if (grant.scopeType === "NAMESPACE") {
    return grant.namespace ?? "—"
  }
  return grant.datasourceName ?? grant.datasourceId ?? "—"
}

export function GrantTable({
  grants,
  onRevoke,
}: {
  readonly grants: readonly GrantResponse[]
  readonly onRevoke: (id: string) => void
}) {
  const { t } = useTranslation()
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null)

  return (
    <table className="w-full text-sm">
      <thead className="text-muted-foreground border-b border-border text-left">
        <tr>
          <th className="px-4 py-2 font-medium">{t("grants.col.scope")}</th>
          <th className="px-4 py-2 font-medium">{t("grants.col.target")}</th>
          <th className="px-4 py-2 font-medium">{t("grants.col.access")}</th>
          <th className="px-4 py-2 font-medium text-right">
            {t("grants.col.actions")}
          </th>
        </tr>
      </thead>
      <tbody>
        {grants.map((grant) => (
          <tr key={grant.id} className="border-b border-border/60 last:border-0">
            <td className="px-4 py-2.5">
              <Badge variant="outline">{grant.scopeType}</Badge>
            </td>
            <td className="px-4 py-2.5 font-medium">{scopeTarget(grant)}</td>
            <td className="px-4 py-2.5">
              <Badge variant={grant.readOnly ? "secondary" : "warning"}>
                {grant.readOnly ? t("grants.readOnlyTag") : t("grants.readWrite")}
              </Badge>
            </td>
            <td className="px-4 py-2.5 text-right">
              {pendingRevoke === grant.id ? (
                <span className="inline-flex items-center gap-1.5">
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => {
                      if (grant.id) onRevoke(grant.id)
                      setPendingRevoke(null)
                    }}
                  >
                    {t("common.confirm")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setPendingRevoke(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => grant.id && setPendingRevoke(grant.id)}
                >
                  {t("grants.revoke")}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
