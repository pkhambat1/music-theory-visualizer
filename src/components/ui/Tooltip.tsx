export interface TooltipProps {
  title?: string;
  children: React.ReactNode;
}

export default function Tooltip({ title, children }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      {title && (
        <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 shadow-xl ring-1 ring-white/[0.08] group-hover:block">
          {title}
        </div>
      )}
    </div>
  );
}
