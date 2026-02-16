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
        "rounded-lg border border-[#d5dbe2] bg-white",
        className,
      )}
      {...props}
    >
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </div>
  );
}
