import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import "@/i18n"
import { LoginPage } from "@/pages/login"
import { makeWrapper } from "@/test/makeWrapper"

const navigate = vi.fn()
let searchValue: { oauthError?: "noAccess" | boolean } = {}

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  getRouteApi: () => ({ useSearch: () => searchValue }),
}))

function renderLoginPage() {
  return render(<LoginPage />, { wrapper: makeWrapper() })
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchValue = {}
  })

  it("renders the Authentik login button alongside the password form", () => {
    renderLoginPage()

    expect(screen.getByTestId("login-username")).toBeInTheDocument()
    expect(screen.getByTestId("login-authentik")).toBeInTheDocument()
    expect(screen.getByTestId("login-authentik")).toHaveTextContent(
      "Login with Authentik"
    )
  })

  it("shows the no-access banner when oauthError=noAccess", () => {
    searchValue = { oauthError: "noAccess" }
    renderLoginPage()

    const banner = screen.getByTestId("login-oauth-error")
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent("Strata access group")
  })

  it("shows no OAuth banner when there is no oauthError", () => {
    renderLoginPage()
    expect(screen.queryByTestId("login-oauth-error")).not.toBeInTheDocument()
  })

  it("navigates to the Authentik authorize endpoint on click", async () => {
    const originalLocation = globalThis.location
    const locationStub = { href: "" }
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: locationStub,
    })

    try {
      renderLoginPage()
      screen.getByTestId("login-authentik").click()
      expect(locationStub.href).toBe("/api/v1/auth/oauth/authentik/authorize")
    } finally {
      Object.defineProperty(globalThis, "location", {
        configurable: true,
        value: originalLocation,
      })
    }
  })
})
