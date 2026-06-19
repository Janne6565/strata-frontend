import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { Provider } from "react-redux"

import "./index.css"
import "@/i18n"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/providers/auth-provider"
import { store } from "@/store/store"
import { routeTree } from "@/routeTree.gen"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
