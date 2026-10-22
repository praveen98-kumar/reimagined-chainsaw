import type * as React from "react";

import { cn } from "@/utils/cn";

export interface DataTableColumn<T> {
  key: keyof T;
  heading: string;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  className?: string;
  rowClassName?: (record: T, index: number) => string;
  onRowClick?: (record: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
}

// Loading skeleton component
function DataTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`table-skeleton-${i.toString()}`}
          className="h-12 bg-gray-200 rounded"
        ></div>
      ))}
    </div>
  );
}

// Empty state component
function DataTableEmpty({ message }: { message: string }) {
  return (
    <div className="w-full text-center py-8 text-muted-foreground">
      {message}
    </div>
  );
}

// Table header component
function DataTableHeader<T>({ columns }: { columns: DataTableColumn<T>[] }) {
  return (
    <thead>
      <tr className="border-b">
        {columns.map((column, index) => (
          <th
            key={`header-${String(column.key)}-${index.toString()}`}
            className={cn(
              "text-left py-3 px-4 font-medium text-sm",
              column.className,
            )}
          >
            {column.heading}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Table body component
function DataTableBody<T extends { id: string | number }>({
  data,
  columns,
  rowClassName,
  onRowClick,
  striped,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
  rowClassName?: (record: T, index: number) => string;
  onRowClick?: (record: T, index: number) => void;
  striped?: boolean;
}) {
  return (
    <tbody>
      {data.map((row, rowIndex) => (
        <DataTableRow
          key={row.id}
          row={row}
          columns={columns}
          rowIndex={rowIndex}
          rowClassName={rowClassName}
          onRowClick={onRowClick}
          striped={striped}
        />
      ))}
    </tbody>
  );
}

// Individual table row component
function DataTableRow<T extends { id: string | number }>({
  row,
  columns,
  rowIndex,
  rowClassName,
  onRowClick,
  striped,
}: {
  row: T;
  columns: DataTableColumn<T>[];
  rowIndex: number;
  rowClassName?: (record: T, index: number) => string;
  onRowClick?: (record: T, index: number) => void;
  striped?: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b transition-colors",
        striped && rowIndex % 2 === 0 && "bg-muted/50",
        rowClassName?.(row, rowIndex),
        onRowClick && "cursor-pointer",
      )}
      onClick={() => onRowClick?.(row, rowIndex)}
    >
      {columns.map((column, colIndex) => (
        <DataTableCell
          key={`cell-${row.id}-${String(column.key)}-${colIndex.toString()}`}
          value={row[column.key]}
          column={column}
          row={row}
          rowIndex={rowIndex}
        />
      ))}
    </tr>
  );
}

// Individual table cell component
function DataTableCell<T>({
  value,
  column,
  row,
  rowIndex,
}: {
  value: T[keyof T];
  column: DataTableColumn<T>;
  row: T;
  rowIndex: number;
}) {
  return (
    <td className={cn("py-3 px-4 text-sm", column.className)}>
      {column.render
        ? column.render(value, row, rowIndex)
        : (value?.toString() ?? "-")}
    </td>
  );
}

// Main table component
function DataTable<T extends { id: string | number }>({
  data,
  columns,
  className,
  rowClassName,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  striped = true,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <DataTableSkeleton count={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <DataTableEmpty message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full">
        <DataTableHeader columns={columns} />
        <DataTableBody
          data={data}
          columns={columns}
          rowClassName={rowClassName}
          onRowClick={onRowClick}
          striped={striped}
        />
      </table>
    </div>
  );
}

export {
  DataTable,
  DataTableSkeleton,
  DataTableEmpty,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
};
