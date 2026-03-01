export type PillProps = {
  label: string,
  variant: "accent" | "muted",
}

export default function Pill({ label, variant }: PillProps) {
  const className =
    variant === "muted"
      ? "rounded bg-gray-200 px-1 text-[9px] font-medium text-gray-600 leading-[14px]"
      : "rounded bg-[var(--app-primaryFill)] px-1 text-[9px] font-medium text-[var(--app-primary)] leading-[14px]"

  return <span className={className}>{label}</span>
}
