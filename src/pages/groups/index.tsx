import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { CreateGroupDialog } from "@/pages/groups/create-group-dialog"
import { GroupBoard } from "@/pages/groups/group-board"
import { useGroupsLogic } from "@/pages/groups/useGroupsLogic"

export function GroupsPage() {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  const {
    groups,
    datasources,
    status,
    errorMessage,
    create,
    rename,
    remove,
    moveMember,
    removeMember,
  } = useGroupsLogic()

  return (
    <div className="animate-fade-up mx-auto flex min-h-full max-w-[1320px] flex-col gap-4 p-7">
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-[22px] font-semibold tracking-tight">
            {t("groups.title")}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t("groups.subtitle")}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("groups.newGroup")}
        </Button>
      </div>

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={create}
      />

      {errorMessage !== null && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {status === "loading" && (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t("common.loading")}
        </p>
      )}
      {status === "failed" && (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-destructive">
          {t("groups.error.load")}
        </p>
      )}
      {status === "idle" && (
        <>
          <GroupBoard
            groups={groups}
            datasources={datasources}
            onRename={rename}
            onDelete={remove}
            onMove={moveMember}
            onRemoveMember={removeMember}
          />
          <div className="mt-auto flex flex-wrap items-center gap-4 rounded-[10px] border border-border bg-[#0c0d11] px-4 py-3 text-[11.5px] text-muted-foreground">
            <span className="font-medium">{t("groups.legend")}</span>
            <span className="flex items-center gap-1.5">
              <span className="size-[7px] rounded-full bg-[#3ecf8e]" />
              {t("databases.healthy")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-[7px] rounded-full bg-[#e5a53b]" />
              {t("groups.degraded")}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
