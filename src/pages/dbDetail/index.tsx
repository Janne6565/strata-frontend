import { Link } from "@tanstack/react-router"
import { ChevronLeft, Table2, TerminalSquare } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrowseTab } from "@/pages/dbDetail/browse-tab"
import { QueryTab } from "@/pages/dbDetail/query-tab"
import { useDatasourceDetailLogic } from "@/pages/dbDetail/useDatasourceDetailLogic"

export function DatasourceDetailPage({ id }: { readonly id: string }) {
  const { t } = useTranslation()
  const { datasource, tables, schemaStatus, reloadSchema } =
    useDatasourceDetailLogic(id)

  const name = datasource?.displayName ?? datasource?.workloadName ?? id
  const engine = [datasource?.driver, datasource?.engineVersion]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <Link
        to="/databases"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        {t("detail.back")}
      </Link>

      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{name}</h1>
          <p className="text-muted-foreground text-sm">
            {engine || t("detail.unknownEngine")}
            {datasource?.namespace ? ` — ${datasource.namespace}` : ""}
          </p>
        </div>
        {datasource?.status && (
          <Badge variant={datasource.status === "PRESENT" ? "success" : "warning"}>
            {datasource.status === "PRESENT"
              ? t("databases.status.present")
              : t("databases.status.missing")}
          </Badge>
        )}
      </header>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">
            <Table2 />
            {t("detail.browse")}
          </TabsTrigger>
          <TabsTrigger value="query">
            <TerminalSquare />
            {t("detail.query")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {schemaStatus === "loading" && (
            <p className="text-muted-foreground p-8 text-center text-sm">
              {t("common.loading")}
            </p>
          )}
          {schemaStatus === "failed" && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-destructive text-sm">{t("detail.schemaError")}</p>
              <Button variant="outline" size="sm" onClick={reloadSchema}>
                {t("common.retry")}
              </Button>
            </div>
          )}
          {schemaStatus === "idle" && <BrowseTab id={id} tables={tables} />}
        </TabsContent>

        <TabsContent value="query">
          <QueryTab id={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
