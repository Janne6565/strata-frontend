import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import { setGlobalSearch } from "@/store/uiSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function AppTopbar() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const globalSearch = useAppSelector((state) => state.ui.globalSearch)

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
      <div className="relative w-full max-w-md">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <input
          type="search"
          value={globalSearch}
          onChange={(event) => dispatch(setGlobalSearch(event.target.value))}
          placeholder={t("search.placeholder")}
          aria-label={t("search.placeholder")}
          className="bg-muted/40 focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border border-input pr-3 pl-8 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-3"
        />
      </div>
    </header>
  )
}
