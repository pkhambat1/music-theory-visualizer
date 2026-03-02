import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:ring-offset-0 disabled:opacity-40 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--app-primary)] text-white font-semibold hover:bg-[var(--app-primaryHover)] active:bg-[var(--app-primary)]",
        ghost:
          "bg-transparent text-[var(--app-textSecondary)] hover:bg-[var(--app-surfaceHover)] hover:text-[var(--app-textPrimary)]",
        destructive:
          "bg-red-500/80 text-white hover:bg-red-500",
        outline:
          "border border-[var(--app-border)] bg-[var(--app-surfaceBase)] hover:bg-[var(--app-surfaceSubtle)] text-[var(--app-textSecondary)]",
        secondary: "bg-[var(--app-surfaceHover)] text-[var(--app-textSecondary)] hover:bg-[var(--app-surfaceSubtle)]",
        link: "text-[var(--app-primary)] underline-offset-4 hover:underline",
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
)

export type ButtonProps = {
  asChild: boolean,
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export default function Button({
  children,
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Comp>
  )
}
