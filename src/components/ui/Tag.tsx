import { cn } from "../../lib/cn";

export interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-sm font-semibold text-slate-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
