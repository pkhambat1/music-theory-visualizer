import React from "react";

export default function Tooltip({ title, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      {title && (
        <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
          {title}
        </div>
      )}
    </div>
  );
}
