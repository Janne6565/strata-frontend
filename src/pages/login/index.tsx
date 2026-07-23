import { Fingerprint } from "lucide-react"
import { useTranslation } from "react-i18next"

import { BrandMark } from "@/components/BrandMark"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { useLoginLogic } from "@/pages/login/useLoginLogic"
import { isNonBlank } from "@/lib/validators"

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
    oauthErrorMessage,
    startAuthentikLogin,
  } = useLoginLogic()

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(1100px 600px at 50% -10%, rgba(100,112,230,.16), transparent 60%), #0a0b0d",
      }}
    >
      <div className="absolute top-6 left-6 flex items-center gap-2.5">
        <BrandMark size={22} />
        <span className="font-semibold tracking-tight">
          {t("common.appName")}
        </span>
      </div>

      <div className="w-[400px] animate-fade-up">
        <div className="mb-7 flex flex-col items-center gap-4">
          <div className="relative flex size-16 items-center justify-center">
            <span
              className="absolute inset-0 rounded-[18px] border border-primary/50"
              style={{ animation: "ringExpand 2.4s ease-out infinite" }}
            />
            <span
              className="absolute inset-0 rounded-[18px] border border-primary/50"
              style={{ animation: "ringExpand 2.4s ease-out infinite 1.2s" }}
            />
            <BrandMark size={64} />
          </div>
          <div className="text-center">
            <h1 className="text-[21px] font-semibold tracking-tight">
              {t("login.title")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("login.subtitle")}
            </p>
          </div>
        </div>

        {oauthErrorMessage !== null && (
          <div
            role="alert"
            data-testid="login-oauth-error"
            className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-3 py-2 text-sm"
          >
            {oauthErrorMessage}
          </div>
        )}

        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#101116] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
        >
          <FormField label={t("login.username")} htmlFor="username">
            <Input
              id="username"
              name="username"
              data-testid="login-username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-invalid={errorMessage !== null}
            />
          </FormField>

          <FormField label={t("login.password")} htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              data-testid="login-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={errorMessage !== null}
            />
          </FormField>

          {errorMessage !== null && (
            <p role="alert" className="text-destructive text-sm" data-testid="login-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            data-testid="login-submit"
            disabled={isSubmitting || !isNonBlank(username) || password.length === 0}
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-[0_6px_20px_rgba(100,112,230,0.4)] transition-[filter] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
            style={{ background: "linear-gradient(180deg,#6f79e6,#5a64d6)" }}
          >
            {isSubmitting && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? t("login.signingIn") : t("common.signIn")}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-muted-foreground/70 text-xs tracking-wide uppercase">
            {t("login.oauthDivider")}
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          type="button"
          variant="outline"
          data-testid="login-authentik"
          onClick={startAuthentikLogin}
          className="h-11 w-full gap-2"
        >
          <Fingerprint aria-hidden size={16} />
          {t("login.oauthAuthentik")}
        </Button>

        <p className="text-muted-foreground/70 mt-3.5 text-center text-xs">
          {t("login.footer")}
        </p>
      </div>
    </div>
  )
}
