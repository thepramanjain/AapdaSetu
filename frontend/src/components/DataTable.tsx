import React from 'react';
import { cn } from '../utils';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No ledger files synced',
  className,
  rowKey
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto w-full", className)}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-mono text-[10px] uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn("py-3.5 px-6 font-bold", col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr 
              key={rowKey(row)} 
              className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium text-gray-300"
            >
              {columns.map((col, cidx) => (
                <td 
                  key={cidx} 
                  className={cn("py-4.5 px-6", col.className)}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td 
                colSpan={columns.length} 
                className="py-12 text-center text-gray-500 font-mono text-xs select-none"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export default DataTable;
