import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        ghost: "bg-transparent text-slate-800 hover:bg-slate-100",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 shadow-sm",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        link: "text-indigo-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export default function Button({
  children,
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? "span" : "button"; // Placeholder for proper Slot implementation if needed later, simplistic for now
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { buttonVariants };
