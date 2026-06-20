import { useState } from "react"
import type { FormEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  CreateGrantRequestScopeType,
  type CreateGrantRequest,
  type CreateGrantRequestScopeType as ScopeType,
  type DatasourceResponse,
} from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CreateGrantForm({
  userId,
  datasources,
  onCreate,
  onClose,
}: {
  readonly userId: string
  readonly datasources: readonly DatasourceResponse[]
  readonly onCreate: (request: CreateGrantRequest) => Promise<boolean>
  readonly onClose: () => void
}) {
  const { t } = useTranslation()
  const [scopeType, setScopeType] = useState<ScopeType>("NAMESPACE")
  const [namespace, setNamespace] = useState("")
  const [datasourceId, setDatasourceId] = useState("")
  const [readOnly, setReadOnly] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const invalid =
    scopeType === "NAMESPACE" ? namespace.trim() === "" : datasourceId === ""

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    const created = await onCreate({
      userId,
      scopeType,
      namespace: scopeType === "NAMESPACE" ? namespace.trim() : undefined,
      datasourceId: scopeType === "DATABASE" ? datasourceId : undefined,
      readOnly,
    })
    setSubmitting(false)
    if (created) {
      setNamespace("")
      setDatasourceId("")
      onClose()
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 border-b border-border p-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="grant-scope">{t("grants.scope")}</Label>
        <Select
          value={scopeType}
          onValueChange={(value) => setScopeType(value as ScopeType)}
        >
          <SelectTrigger id="grant-scope" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CreateGrantRequestScopeType).map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {scopeType === "NAMESPACE" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grant-namespace">{t("grants.namespace")}</Label>
          <Input
            id="grant-namespace"
            value={namespace}
            placeholder="team-a"
            onChange={(event) => setNamespace(event.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grant-datasource">{t("grants.datasource")}</Label>
          <Select
            value={datasourceId === "" ? undefined : datasourceId}
            disabled={datasources.length === 0}
            onValueChange={setDatasourceId}
          >
            <SelectTrigger id="grant-datasource" className="w-56">
              <SelectValue
                placeholder={
                  datasources.length === 0
                    ? t("grants.noDatasources")
                    : t("grants.pickDatasource")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {datasources.map((datasource) => (
                <SelectItem key={datasource.id} value={datasource.id ?? ""}>
                  {datasource.displayName ??
                    datasource.workloadName ??
                    datasource.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <label className="flex h-8 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={readOnly}
          onChange={(event) => setReadOnly(event.target.checked)}
        />
        {t("grants.readOnly")}
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={invalid || submitting}>
          {t("grants.grant")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  )
}
