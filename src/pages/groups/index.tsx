import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { GroupBoard } from "@/pages/groups/group-board"
import { useGroupsLogic } from "@/pages/groups/useGroupsLogic"

export function GroupsPage() {
  const { t } = useTranslation()
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
          <p className="text-muted-foreground mt-1 text-[13px]">
            {t("groups.subtitle")}
          </p>
        </div>
        <Button size="sm" onClick={() => create(t("groups.newGroupName"))}>
          <Plus />
          {t("groups.newGroup")}
        </Button>
      </div>

      {errorMessage !== null && (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      )}

      {status === "loading" && (
        <p className="text-muted-foreground rounded-xl border border-border bg-card p-8 text-center text-sm">
          {t("common.loading")}
        </p>
      )}
      {status === "failed" && (
        <p className="text-destructive rounded-xl border border-border bg-card p-8 text-center text-sm">
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
          <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-4 rounded-[10px] border border-border bg-[#0c0d11] px-4 py-3 text-[11.5px]">
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
