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
    <div className={cn("w-full overflow-x-auto border border-border rounded-2xl bg-white shadow-card", className)}>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-surface/70 border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 font-semibold text-content-secondary uppercase tracking-wider text-[11px]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr 
              key={row.id} 
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-all duration-150 group border-b border-border last:border-b-0",
                onRowClick 
                  ? "cursor-pointer hover:bg-navy-50/30 active:bg-navy-50/50" 
                  : "",
                // Subtle alternating row tint
                idx % 2 === 1 && "bg-surface/30"
              )}
              style={{ animationDelay: `${idx * 30}ms` }}
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