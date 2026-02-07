import { cn } from "../../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bodyClassName?: string;
}

export default function Card({
  children,
  className,
  bodyClassName,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/30 backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </div>
  );
}
