import type { ReactNode } from "react"
import { Provider } from "react-redux"

import { setupStore } from "@/store/store"
import type { RootState } from "@/store/store"

/**
 * Wraps Redux-connected components/hooks in a fresh store for tests.
 * Usage: renderHook(() => useFooLogic(), { wrapper: makeWrapper(preloadedState) }).
 */
export function makeWrapper(preloadedState?: Partial<RootState>) {
  const store = setupStore(preloadedState)
  return function Wrapper({ children }: { readonly children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}
