import { useCallback, useState } from "react"
import type { FormEvent } from "react"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { login } from "@/api/generated/authentication/authentication"
import { setAuthToken } from "@/lib/auth"
import { extractProblemDetail } from "@/lib/errors"
import { setIdentity } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"

// Accessor for the /login route's validated search params. Fetched via
// getRouteApi (not by importing the route module) to avoid a circular import
// between the route and this page.
const loginRoute = getRouteApi("/login")

// Full-navigation target for the OAuth handshake. The backend 302s to Authentik,
// so this must be a browser navigation, never an axios call.
const AUTHENTIK_AUTHORIZE_PATH = "/api/v1/auth/oauth/authentik/authorize"

/**
 * Drives the login form: holds the field state, calls `login`, persists the
 * token + identity on success, and exposes a resolved error message on failure.
 * The call is made directly (not via useDataInteractions) because the form needs
 * the backend's ProblemDetail message inline, which the generic seam discards.
 *
 * Also surfaces the OAuth outcome: `oauthErrorMessage` maps the `oauthError`
 * search param (set by the backend's callback redirect) to a translated banner,
 * and `startAuthentikLogin` kicks off the "Login with Authentik" flow.
 */
export function useLoginLogic() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { oauthError } = loginRoute.useSearch()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setErrorMessage(null)
      setIsSubmitting(true)

      try {
        const response = await login({ username: username.trim(), password })
        if (!response.token) {
          setErrorMessage(t("login.error.generic"))
          return
        }

        setAuthToken(response.token)
        dispatch(
          setIdentity({ token: response.token, user: response.user ?? null })
        )
        void navigate({ to: "/" })
      } catch (error) {
        setErrorMessage(extractProblemDetail(error) ?? t("login.error.generic"))
      } finally {
        setIsSubmitting(false)
      }
    },
    [username, password, t, dispatch, navigate]
  )

  const startAuthentikLogin = useCallback(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? ""
    globalThis.location.href = `${base}${AUTHENTIK_AUTHORIZE_PATH}`
  }, [])

  // `noAccess` = authenticated but not in a strata-* group; any other truthy
  // value = a generic OAuth failure the backend couldn't attribute.
  const oauthErrorMessage =
    oauthError === "noAccess"
      ? t("login.error.oauthNoAccess")
      : oauthError
        ? t("login.error.oauthGeneric")
        : null

  return {
    username,
    setUsername,
    password,
    setPassword,
    submit,
    isSubmitting,
    errorMessage,
    oauthErrorMessage,
    startAuthentikLogin,
  }
}
