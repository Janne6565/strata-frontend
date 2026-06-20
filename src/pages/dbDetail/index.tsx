import { Link } from "@tanstack/react-router"
import { ChevronLeft, Gauge, Table2, TerminalSquare } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthInformation } from "@/hooks/useAuthInformation"
import { engineStyle, engineTint } from "@/lib/engine"
import { BrowseTab } from "@/pages/dbDetail/browse-tab"
import { EditableName } from "@/pages/dbDetail/editable-name"
import { OverviewTab } from "@/pages/dbDetail/overview-tab"
import { QueryTab } from "@/pages/dbDetail/query-tab"
import { useDatasourceDetailLogic } from "@/pages/dbDetail/useDatasourceDetailLogic"

export function DatasourceDetailPage({ id }: { readonly id: string }) {
  const { t } = useTranslation()
  const { isAdmin } = useAuthInformation()
  const {
    datasource,
    tables,
    schemaStatus,
    schemaError,
    reloadSchema,
    rename,
    isRenaming,
  } = useDatasourceDetailLogic(id)

  // Map the backend's dev-facing messages to friendly copy; pass through the
  // rest (e.g. a missing Secret key), which are already admin-readable.
  const schemaReason = schemaError?.includes("no backing service")
    ? t("detail.schemaNoService")
    : schemaError?.includes("no resolved credentials")
      ? t("detail.schemaNoCredentials")
      : schemaError

  const name = datasource?.displayName ?? datasource?.workloadName ?? id
  const engine = engineStyle(datasource?.driver)
  const present = datasource?.status === "PRESENT"
  const statusColor = present ? "#3ecf8e" : "#e5a53b"
  const subline = [
    [datasource?.driver, datasource?.engineVersion].filter(Boolean).join(" ") ||
      t("detail.unknownEngine"),
    datasource?.namespace,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="animate-fade-up mx-auto flex max-w-5xl flex-col gap-4 p-7">
      <Link
        to="/databases"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        {t("detail.back")}
      </Link>

      <header className="flex items-center gap-4">
        <span
          className="flex size-[46px] shrink-0 items-center justify-center rounded-xl border font-mono text-[15px] font-semibold"
          style={engineTint(datasource?.driver)}
        >
          {engine.short}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <EditableName
              value={name}
              canEdit={isAdmin && Boolean(datasource?.id)}
              isSaving={isRenaming}
              onSave={rename}
            />
            {datasource?.status && (
              <span
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[12px]"
                style={{ color: statusColor }}
              >
                <span
                  className="size-[7px] rounded-full"
                  style={{ background: statusColor }}
                />
                {present
                  ? t("databases.healthy")
                  : t("databases.status.missing")}
              </span>
            )}
          </div>
          <div className="text-muted-foreground mt-1 font-mono text-[12px]">
            {subline}
          </div>
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <Gauge />
            {t("detail.overview")}
          </TabsTrigger>
          <TabsTrigger value="browse">
            <Table2 />
            {t("detail.browse")}
          </TabsTrigger>
          <TabsTrigger value="query">
            <TerminalSquare />
            {t("detail.query")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab datasource={datasource} />
        </TabsContent>

        <TabsContent value="browse">
          {schemaStatus === "loading" && (
            <p className="text-muted-foreground p-8 text-center text-sm">
              {t("common.loading")}
            </p>
          )}
          {schemaStatus === "failed" && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="flex flex-col gap-1">
                <p className="text-destructive text-sm font-medium">
                  {t("detail.schemaError")}
                </p>
                {schemaReason && (
                  <p className="text-muted-foreground mx-auto max-w-md text-xs">
                    {schemaReason}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={reloadSchema}>
                {t("common.retry")}
              </Button>
            </div>
          )}
          {schemaStatus === "idle" && (
            <BrowseTab id={id} tables={tables} driver={datasource?.driver} />
          )}
        </TabsContent>

        <TabsContent value="query">
          <QueryTab id={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
