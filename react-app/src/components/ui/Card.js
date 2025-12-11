import React from "react";
import { cn } from "../../lib/utils";

export default function Card({ children, className, bodyClassName, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    >
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </div>
  );
}
