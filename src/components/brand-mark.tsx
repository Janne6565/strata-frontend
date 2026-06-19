import { cn } from "@/lib/utils"

/**
 * The Strata brand mark: a white rotated-square "diamond" inside a gradient
 * rounded tile. Used in the sidebar rail and the login screen.
 */
export function BrandMark({
  size = 30,
  className,
}: {
  readonly size?: number
  readonly className?: string
}) {
  const inner = Math.round(size * 0.34)
  const border = Math.max(1.6, size * 0.037)
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-[28%]", className)}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(150deg,#7d86ef,#5159c9)",
        boxShadow: "0 3px 12px rgba(100,112,230,.4)",
      }}
    >
      <span
        style={{
          display: "block",
          width: inner,
          height: inner,
          border: `${border}px solid #fff`,
          transform: "rotate(45deg)",
          borderRadius: 2,
        }}
      />
    </div>
  )
}
