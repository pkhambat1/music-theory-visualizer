import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-75 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:ring-offset-0 disabled:opacity-40 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-semibold hover:from-cyan-400 hover:to-cyan-300 shadow-lg shadow-cyan-500/25",
        ghost:
          "bg-transparent text-slate-300 hover:bg-white/[0.08] hover:text-slate-100",
        destructive:
          "bg-red-500/80 text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
        outline:
          "border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200",
        secondary: "bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-10 px-5 py-2 text-sm",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export default function Button({
  children,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Comp>
  );
}

export { buttonVariants };
