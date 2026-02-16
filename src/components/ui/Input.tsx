import { cn } from "../../lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[#d5dbe2] bg-white px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#64BDFF] focus:ring-1 focus:ring-[#64BDFF]",
        className,
      )}
      {...rest}
    />
  );
}
