import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { CreateUserForm } from "@/pages/admin/users/create-user-form"
import { UserTable } from "@/pages/admin/users/user-table"
import { useUsersLogic } from "@/pages/admin/users/useUsersLogic"

export function UsersPage() {
  const { t } = useTranslation()
  const {
    users,
    status,
    createUser,
    changeRole,
    removeUser,
    errorMessage,
    clearError,
    currentUserId,
  } = useUsersLogic()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{t("users.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("users.subtitle", { count: users.length })}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            clearError()
            setShowForm((open) => !open)
          }}
        >
          <Plus />
          {t("users.add")}
        </Button>
      </div>

      {errorMessage !== null && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card">
        {showForm && (
          <CreateUserForm
            onCreate={createUser}
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
            {t("users.error.load")}
          </p>
        )}
        {status === "idle" && (
          <UserTable
            users={users}
            currentUserId={currentUserId}
            onChangeRole={changeRole}
            onDelete={removeUser}
          />
        )}
      </div>
    </div>
  )
}
