export interface TooltipProps {
  title?: string;
  children: React.ReactNode;
}

export default function Tooltip({ title, children }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      {title && (
        <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2a2738] px-2.5 py-1 text-xs font-medium text-white ring-1 ring-[#2a2738] group-hover:block">
          {title}
        </div>
      )}
    </div>
  );
}
