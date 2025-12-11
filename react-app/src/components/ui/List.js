import React from "react";
import clsx from "clsx";

export function List({ dataSource = [], renderItem, className }) {
  return (
    <ul className={clsx("flex flex-col gap-2", className)}>
      {dataSource.map((item, idx) => (
        <li key={idx}>{renderItem?.(item, idx)}</li>
      ))}
    </ul>
  );
}

export function ListItem({ children, className }) {
  return <div className={clsx("flex w-full", className)}>{children}</div>;
}
