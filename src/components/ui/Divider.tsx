import { cn } from "../../lib/cn";

export interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return <div className={cn("h-px w-full bg-[var(--d3-border)]", className)} />;
}
