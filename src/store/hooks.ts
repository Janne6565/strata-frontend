import { useDispatch, useSelector } from "react-redux"
import type { TypedUseSelectorHook } from "react-redux"

import type { AppDispatch, RootState } from "@/store/store"

// Typed wrappers — always use these instead of the raw react-redux hooks.
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
