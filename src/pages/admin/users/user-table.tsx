import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  ChangeRoleRequestRole,
  type ChangeRoleRequestRole as Role,
  type UserResponse,
} from "@/api/generated/model"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NativeSelect } from "@/components/ui/native-select"

const ROLES = Object.values(ChangeRoleRequestRole)

export function UserTable({
  users,
  currentUserId,
  onChangeRole,
  onDelete,
}: {
  readonly users: readonly UserResponse[]
  readonly currentUserId: string | null
  readonly onChangeRole: (id: string, role: Role) => void
  readonly onDelete: (id: string) => void
}) {
  const { t } = useTranslation()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  return (
    <table className="w-full text-sm">
      <thead className="text-muted-foreground border-b border-border text-left">
        <tr>
          <th className="px-4 py-2 font-medium">{t("users.col.username")}</th>
          <th className="px-4 py-2 font-medium">{t("users.col.role")}</th>
          <th className="px-4 py-2 font-medium">{t("users.col.status")}</th>
          <th className="px-4 py-2 font-medium text-right">
            {t("users.col.actions")}
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          return (
            <tr
              key={user.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-2.5 font-medium">
                {user.username}
                {isSelf && (
                  <span className="text-muted-foreground ml-1.5 text-xs">
                    {t("users.you")}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <NativeSelect
                  value={user.role}
                  disabled={isSelf}
                  onChange={(event) =>
                    user.id && onChangeRole(user.id, event.target.value as Role)
                  }
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </NativeSelect>
              </td>
              <td className="px-4 py-2.5">
                <Badge variant={user.enabled ? "success" : "outline"}>
                  {user.enabled ? t("users.enabled") : t("users.disabled")}
                </Badge>
              </td>
              <td className="px-4 py-2.5 text-right">
                {pendingDelete === user.id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => {
                        if (user.id) onDelete(user.id)
                        setPendingDelete(null)
                      }}
                    >
                      {t("common.confirm")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setPendingDelete(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={isSelf}
                    aria-label={t("common.delete")}
                    onClick={() => user.id && setPendingDelete(user.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
