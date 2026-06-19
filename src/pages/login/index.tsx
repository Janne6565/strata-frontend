import { useTranslation } from "react-i18next"

import { BrandMark } from "@/components/brand-mark"
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

        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#101116] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
        >
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
            <p role="alert" className="text-destructive text-sm" data-testid="login-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || username.trim() === "" || password === ""}
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-[0_6px_20px_rgba(100,112,230,0.4)] transition-[filter] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
            style={{ background: "linear-gradient(180deg,#6f79e6,#5a64d6)" }}
          >
            {isSubmitting && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isSubmitting ? t("login.signingIn") : t("common.signIn")}
          </button>
        </form>

        <p className="text-muted-foreground/70 mt-3.5 text-center text-xs">
          {t("login.footer")}
        </p>
      </div>
    </div>
  )
}
