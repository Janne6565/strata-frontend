import { useState } from "react"
import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui"
import { useTranslation } from "react-i18next"

import type { TableInfo } from "@/api/generated/model"
import { BrowsePanel } from "@/pages/dbDetail/BrowsePanel"
import { useRowBrowserLogic } from "@/pages/dbDetail/useRowBrowserLogic"

export function BrowseTab({
  id,
  tables,
  driver,
}: {
  readonly id: string
  readonly tables: readonly TableInfo[]
  readonly driver?: string
}) {
  const { t } = useTranslation()
  const browser = useRowBrowserLogic(id)
  const [enlarged, setEnlarged] = useState(false)

  return (
    <>
      <div className="h-[60vh]">
        <BrowsePanel
          browser={browser}
          tables={tables}
          driver={driver}
          enlarged={false}
          onToggleEnlarge={() => setEnlarged(true)}
        />
      </div>

      <DialogPrimitive.Root open={enlarged} onOpenChange={setEnlarged}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 flex h-[88vh] w-[92vw] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <VisuallyHidden.Root>
              <DialogPrimitive.Title>
                {browser.selected
                  ? (browser.selected.name ?? t("detail.browse"))
                  : t("detail.browse")}
              </DialogPrimitive.Title>
            </VisuallyHidden.Root>
            <BrowsePanel
              browser={browser}
              tables={tables}
              driver={driver}
              enlarged
              onToggleEnlarge={() => setEnlarged(false)}
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
