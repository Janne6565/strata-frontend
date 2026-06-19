import * as React from "react"

import { cn } from "@/lib/utils"

/** Lightweight styled native <select> — enough for role/scope pickers. */
function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect }
