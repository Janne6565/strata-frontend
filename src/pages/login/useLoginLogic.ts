import { useCallback, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { login } from "@/api/generated/authentication/authentication"
import { setAuthToken } from "@/lib/auth"
import { extractProblemDetail } from "@/lib/errors"
import { setIdentity } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"

/**
 * Drives the login form: holds the field state, calls `login`, persists the
 * token + identity on success, and exposes a resolved error message on failure.
 * The call is made directly (not via useDataInteractions) because the form needs
 * the backend's ProblemDetail message inline, which the generic seam discards.
 */
export function useLoginLogic() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

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

  return {
    username,
    setUsername,
    password,
    setPassword,
    submit,
    isSubmitting,
    errorMessage,
  }
}
