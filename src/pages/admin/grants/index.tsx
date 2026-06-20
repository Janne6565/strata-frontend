import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateGrantForm } from "@/pages/admin/grants/create-grant-form"
import { GrantTable } from "@/pages/admin/grants/grant-table"
import { useGrantsLogic } from "@/pages/admin/grants/useGrantsLogic"

export function GrantsPage() {
  const { t } = useTranslation()
  const {
    users,
    datasources,
    selectedUserId,
    selectUser,
    grants,
    status,
    errorMessage,
    createGrant,
    revokeGrant,
  } = useGrantsLogic()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("grants.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("grants.subtitle")}</p>
        </div>
        {selectedUserId !== "" && (
          <Button size="sm" onClick={() => setShowForm((open) => !open)}>
            <Plus />
            {t("grants.add")}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="grant-user">{t("grants.user")}</Label>
        <Select
          value={selectedUserId === "" ? undefined : selectedUserId}
          onValueChange={(value) => {
            setShowForm(false)
            selectUser(value)
          }}
        >
          <SelectTrigger id="grant-user" className="w-full max-w-xs">
            <SelectValue placeholder={t("grants.pickUser")} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id ?? ""}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {errorMessage !== null && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      {selectedUserId === "" ? (
        <p className="text-muted-foreground p-8 text-center text-sm">
          {t("grants.selectPrompt")}
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {showForm && (
            <CreateGrantForm
              userId={selectedUserId}
              datasources={datasources}
              onCreate={createGrant}
              onClose={() => setShowForm(false)}
            />
          )}
          {status === "loading" && (
            <p className="text-muted-foreground p-8 text-center text-sm">
              {t("common.loading")}
            </p>
          )}
          {status === "failed" && (
            <p className="text-destructive p-8 text-center text-sm">
              {t("grants.error.load")}
            </p>
          )}
          {status === "idle" && grants.length === 0 && (
            <p className="text-muted-foreground p-8 text-center text-sm">
              {t("grants.empty")}
            </p>
          )}
          {status === "idle" && grants.length > 0 && (
            <GrantTable grants={grants} onRevoke={revokeGrant} />
          )}
        </div>
      )}
    </div>
  )
}
