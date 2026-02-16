import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#64BDFF] focus:ring-offset-0 disabled:opacity-40 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#009CDE] text-white font-semibold hover:bg-[#0088C2] active:bg-[#0074A6]",
        ghost:
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        destructive:
          "bg-red-500/80 text-white hover:bg-red-500",
        outline:
          "border border-[#d5dbe2] bg-white hover:bg-gray-50 text-gray-700",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        link: "text-[#009CDE] underline-offset-4 hover:underline",
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
