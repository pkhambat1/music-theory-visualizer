export type PillProps = {
  label: string,
}

export default function Pill({ label }: PillProps) {
  return (
    <span className="rounded-full bg-[#F5F0E8] px-1.5 text-[9px] font-semibold text-black leading-[16px]">
      {label}
    </span>
  )
}
