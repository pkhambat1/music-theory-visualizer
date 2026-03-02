export type PillProps = {
  label: string,
}

export default function Pill({ label }: PillProps) {
  return (
    <span
      className="rounded-full px-1.5 text-[9px] font-semibold text-black leading-[16px]"
      style={{
        background: "#F5F0E8",
        border: "1px solid #D5CFC5",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      {label}
    </span>
  )
}
