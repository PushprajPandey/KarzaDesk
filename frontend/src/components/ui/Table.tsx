"use client";

import React from "react";

export type TableColumn<T> = {
  header: string;
  key: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyText?: string;
};

export function Table<T>({
  columns,
  rows,
  isLoading,
  emptyText = "No records found",
}: Props<T>): JSX.Element {
  return (
    <div className="w-full overflow-x-auto bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
      <table
        className="min-w-full text-left border-collapse"
        style={{ minWidth: "600px" }}
      >
        <thead className="bg-surface-container-low border-b border-outline-variant">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3 font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wider"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <tr
                key={idx}
                className="hover:bg-surface transition-colors duration-150"
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="h-3 sm:h-4 w-full animate-pulse rounded bg-surface-variant" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td
                className="px-3 py-4 sm:px-4 sm:py-6 text-center font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={i}
                className="hover:bg-surface transition-colors duration-150"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="whitespace-nowrap px-3 py-2.5 sm:px-4 sm:py-3 font-body-xs sm:font-body-sm text-body-xs sm:text-body-sm text-on-surface"
                  >
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
