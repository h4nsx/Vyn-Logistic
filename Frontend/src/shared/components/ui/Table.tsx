import { cn } from '../../utils/cn';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T extends { id: string | number }>({ 
  columns, 
  rows, 
  onRowClick,
  className 
}: TableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto border border-border rounded-2xl bg-white", className)}>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 font-semibold text-navy uppercase tracking-wider text-[11px]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr 
              key={row.id} 
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors group",
                onRowClick ? "cursor-pointer hover:bg-surface" : ""
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-content-secondary">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}