import type { Key, ReactNode } from "react";

export interface Column<T> {
  header: string;
  align?: "left" | "center";
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => Key;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, rowKey, loading = false, emptyMessage = "Aucune donnée." }: DataTableProps<T>) {
  if (loading) return <p className="helper-text">Chargement...</p>;
  if (rows.length === 0) return <p className="helper-text">{emptyMessage}</p>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header} align={col.align ?? "left"}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((col) => (
              <td key={col.header} align={col.align ?? "left"}>
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
