export type PillProps = {
  label: string,
}

export default function Pill({ label }: PillProps) {
  return (
    <span
      className="rounded-full px-1.5 text-[9px] font-semibold text-[var(--app-textOnSurface)] leading-[16px]"
      style={{
        background: "var(--app-pillBg)",
        border: "1px solid var(--app-pillBorder)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      {label}
    </span>
  )
}
