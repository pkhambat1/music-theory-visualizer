import { cn } from "../../lib/cn";

export interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return <div className={cn("h-px w-full bg-[#d5dbe2]", className)} />;
}
