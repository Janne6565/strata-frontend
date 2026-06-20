import { useState } from "react"
import type { FormEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  CreateUserRequestRole,
  type CreateUserRequest,
  type CreateUserRequestRole as Role,
} from "@/api/generated/model"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isNonBlank, meetsPasswordPolicy, PASSWORD_MIN } from "@/lib/validators"

const ROLES = Object.values(CreateUserRequestRole)

interface CreateUserFormProps {
  readonly onCreate: (request: CreateUserRequest) => Promise<boolean>
  readonly onClose: () => void
}

export function CreateUserForm({ onCreate, onClose }: CreateUserFormProps) {
  const { t } = useTranslation()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("USER")
  const [submitting, setSubmitting] = useState(false)

  const invalid = !isNonBlank(username) || !meetsPasswordPolicy(password)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    const created = await onCreate({ username: username.trim(), password, role })
    setSubmitting(false)
    if (created) {
      onClose()
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 border-b border-border p-4"
    >
      <FormField label={t("users.col.username")} htmlFor="new-username">
        <Input
          id="new-username"
          data-testid="new-username"
          value={username}
          autoFocus
          onChange={(event) => setUsername(event.target.value)}
        />
      </FormField>
      <FormField label={t("login.password")} htmlFor="new-password">
        <Input
          id="new-password"
          data-testid="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>
      <FormField label={t("users.col.role")} htmlFor="new-role">
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger id="new-role" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          data-testid="create-user-submit"
          disabled={invalid || submitting}
        >
          {t("users.create")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("common.cancel")}
        </Button>
      </div>
      <p className="text-muted-foreground basis-full text-xs">
        {t("users.passwordHint", { min: PASSWORD_MIN })}
      </p>
    </form>
  )
}
