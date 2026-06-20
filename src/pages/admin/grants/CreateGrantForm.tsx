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
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isGrantScopeValid } from "@/lib/validators"

interface CreateGrantFormProps {
  readonly userId: string
  readonly datasources: readonly DatasourceResponse[]
  readonly onCreate: (request: CreateGrantRequest) => Promise<boolean>
  readonly onClose: () => void
}

export function CreateGrantForm({
  userId,
  datasources,
  onCreate,
  onClose,
}: CreateGrantFormProps) {
  const { t } = useTranslation()
  const [scopeType, setScopeType] = useState<ScopeType>("NAMESPACE")
  const [namespace, setNamespace] = useState("")
  const [datasourceId, setDatasourceId] = useState("")
  const [readOnly, setReadOnly] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const invalid = !isGrantScopeValid(scopeType, namespace, datasourceId)

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
      <FormField label={t("grants.scope")} htmlFor="grant-scope">
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
      </FormField>

      {scopeType === "NAMESPACE" ? (
        <FormField label={t("grants.namespace")} htmlFor="grant-namespace">
          <Input
            id="grant-namespace"
            data-testid="grant-namespace"
            value={namespace}
            placeholder="team-a"
            onChange={(event) => setNamespace(event.target.value)}
          />
        </FormField>
      ) : (
        <FormField label={t("grants.datasource")} htmlFor="grant-datasource">
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
        </FormField>
      )}

      <div className="flex h-8 items-center gap-2">
        <Checkbox
          id="grant-readonly"
          checked={readOnly}
          onChange={(event) => setReadOnly(event.target.checked)}
        />
        <Label htmlFor="grant-readonly" className="text-sm">
          {t("grants.readOnly")}
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          data-testid="create-grant-submit"
          disabled={invalid || submitting}
        >
          {t("grants.grant")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  )
}
