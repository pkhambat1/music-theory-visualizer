import { cn } from "../../lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-slate-200 shadow-sm outline-none placeholder:text-slate-500 transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20",
        className,
      )}
      {...rest}
    />
  );
}
