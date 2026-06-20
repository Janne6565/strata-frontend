import { useState } from "react"
import type { FormEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  CreateUserRequestRole,
  type CreateUserRequest,
  type CreateUserRequestRole as Role,
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

const MIN_PASSWORD = 8
const ROLES = Object.values(CreateUserRequestRole)

export function CreateUserForm({
  onCreate,
  onClose,
}: {
  readonly onCreate: (request: CreateUserRequest) => Promise<boolean>
  readonly onClose: () => void
}) {
  const { t } = useTranslation()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("USER")
  const [submitting, setSubmitting] = useState(false)

  const invalid = username.trim() === "" || password.length < MIN_PASSWORD

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-username">{t("users.col.username")}</Label>
        <Input
          id="new-username"
          value={username}
          autoFocus
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">{t("login.password")}</Label>
        <Input
          id="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-role">{t("users.col.role")}</Label>
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
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={invalid || submitting}>
          {t("users.create")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("common.cancel")}
        </Button>
      </div>
      <p className="text-muted-foreground basis-full text-xs">
        {t("users.passwordHint", { min: MIN_PASSWORD })}
      </p>
    </form>
  )
}
