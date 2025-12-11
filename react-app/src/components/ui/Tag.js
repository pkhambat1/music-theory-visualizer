import React from "react";
import clsx from "clsx";

export default function Tag({ children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-900",
        className
      )}
    >
      {children}
    </span>
  );
}
