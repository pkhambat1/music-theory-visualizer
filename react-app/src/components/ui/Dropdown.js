import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Button from "./Button";

export default function Dropdown({ label, items = [], onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
        {label}
      </Button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 min-w-[160px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <ul className="py-1">
            {items.map((item) => (
              <li key={item.key}>
                <button
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                  )}
                  onClick={() => {
                    onSelect?.(item.key);
                    setOpen(false);
                  }}
                >
                  {item.label || item.key}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
