import React from "react";
import clsx from "clsx";

export default function Divider({ className }) {
  return <div className={clsx("h-px w-full bg-slate-200", className)} />;
}
