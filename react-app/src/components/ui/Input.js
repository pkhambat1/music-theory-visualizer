import React from "react";
import clsx from "clsx";

export default function Input({ className, ...rest }) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
        className
      )}
      {...rest}
    />
  );
}
