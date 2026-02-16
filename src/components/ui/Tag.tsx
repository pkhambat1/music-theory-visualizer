import { cn } from "../../lib/cn";

export interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-[#d5dbe2] bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
