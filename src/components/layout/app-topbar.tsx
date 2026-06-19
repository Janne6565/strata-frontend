import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import { setGlobalSearch } from "@/store/uiSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function AppTopbar() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const globalSearch = useAppSelector((state) => state.ui.globalSearch)

  return (
    <header className="flex h-[50px] shrink-0 items-center gap-3.5 border-b border-border bg-[#0b0c0e] px-4">
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <span className="size-[7px] rounded-full bg-success shadow-[0_0_8px_rgba(62,207,142,0.6)]" />
        <span className="font-mono text-[#c4c7cd]">strata</span>
      </div>

      <div className="flex-1" />

      <div className="flex h-8 w-[280px] max-w-[34vw] items-center gap-2 rounded-lg border border-input bg-[#111217] px-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={globalSearch}
          onChange={(event) => dispatch(setGlobalSearch(event.target.value))}
          placeholder={t("search.placeholder")}
          aria-label={t("search.placeholder")}
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-white/10 px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>
    </header>
  )
}
