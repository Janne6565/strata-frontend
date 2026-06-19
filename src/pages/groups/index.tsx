import { useState } from "react"
import type { FormEvent } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GroupList } from "@/pages/groups/group-list"
import { useGroupsLogic } from "@/pages/groups/useGroupsLogic"

export function GroupsPage() {
  const { t } = useTranslation()
  const { groups, status, errorMessage, create, rename, remove, reorder } =
    useGroupsLogic()
  const [newName, setNewName] = useState("")

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newName.trim() === "") {
      return
    }
    const created = await create(newName)
    if (created) {
      setNewName("")
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{t("groups.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("groups.subtitle")}</p>
      </div>

      <form onSubmit={submitCreate} className="flex items-center gap-2">
        <Input
          value={newName}
          placeholder={t("groups.namePlaceholder")}
          className="max-w-xs"
          onChange={(event) => setNewName(event.target.value)}
        />
        <Button type="submit" size="sm" disabled={newName.trim() === ""}>
          <Plus />
          {t("groups.add")}
        </Button>
      </form>

      {errorMessage !== null && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card">
        {status === "loading" && (
          <p className="text-muted-foreground p-8 text-center text-sm">
            {t("common.loading")}
          </p>
        )}
        {status === "failed" && (
          <p className="text-destructive p-8 text-center text-sm">
            {t("groups.error.load")}
          </p>
        )}
        {status === "idle" && groups.length === 0 && (
          <p className="text-muted-foreground p-8 text-center text-sm">
            {t("groups.empty")}
          </p>
        )}
        {status === "idle" && groups.length > 0 && (
          <GroupList
            groups={groups}
            onRename={rename}
            onDelete={remove}
            onReorder={reorder}
          />
        )}
      </div>
    </div>
  )
}
