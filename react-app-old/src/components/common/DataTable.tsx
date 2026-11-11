import type { ReactElement } from 'react';
import type { Column, SortDir } from '../../types';

interface DataTableProps<T extends { id: string }> {
  /** Read by screen readers only. */
  caption: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
}

type AriaSort = 'ascending' | 'descending' | 'none';

/** Generic table: knows nothing about models. Columns describe how to show each row. */
export function DataTable<T extends { id: string }>({
  caption,
  columns,
  rows,
  sortKey,
  sortDir,
  onSort
}: DataTableProps<T>): ReactElement {
  return (
    <table>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map(column => {
            const active = column.sortable === true && column.key === sortKey;
            const ariaSort: AriaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';

            return (
              <th key={column.key} scope="col" aria-sort={column.sortable === true ? ariaSort : undefined}>
                {column.sortable === true ? (
                  <button
                    type="button"
                    className="sort"
                    data-dir={active ? sortDir : undefined}
                    onClick={() => onSort(column.key)}
                  >
                    {column.header}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id}>
            {columns.map(column =>
              column.rowHeader === true ? (
                <th key={column.key} scope="row" className="cell-name">
                  {column.render(row)}
                </th>
              ) : (
                <td key={column.key}>{column.render(row)}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
