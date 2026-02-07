import clsx from "clsx";

export interface ListProps<T> {
  dataSource?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function List<T>({
  dataSource = [],
  renderItem,
  className,
}: ListProps<T>) {
  return (
    <ul className={clsx("flex flex-col gap-2", className)}>
      {dataSource.map((item, idx) => (
        <li key={idx}>{renderItem?.(item, idx)}</li>
      ))}
    </ul>
  );
}

export interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function ListItem({ children, className }: ListItemProps) {
  return <div className={clsx("flex w-full", className)}>{children}</div>;
}
