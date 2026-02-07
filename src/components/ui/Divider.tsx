import { cn } from "../../lib/cn";

export interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return <div className={cn("h-px w-full bg-white/[0.08]", className)} />;
}
