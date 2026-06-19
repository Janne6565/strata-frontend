import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLoginLogic } from "@/pages/login/useLoginLogic"

export function LoginPage() {
  const { t } = useTranslation()
  const {
    username,
    setUsername,
    password,
    setPassword,
    submit,
    isSubmitting,
    errorMessage,
  } = useLoginLogic()

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("common.appName")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("login.subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("login.title")}</CardTitle>
            <CardDescription>{t("login.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">{t("login.username")}</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-invalid={errorMessage !== null}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={errorMessage !== null}
                />
              </div>

              {errorMessage !== null && (
                <p
                  role="alert"
                  className="text-destructive text-sm"
                  data-testid="login-error"
                >
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full"
                disabled={isSubmitting || username.trim() === "" || password === ""}
              >
                {isSubmitting ? t("login.signingIn") : t("common.signIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
