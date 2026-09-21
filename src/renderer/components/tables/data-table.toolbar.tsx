"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { RowData, Table } from "@tanstack/react-table";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { cn } from "@/renderer/utils";
import { TableColumnVisibility } from "./data-table.column-visibility";
import { TableFeature } from "./hooks";
import { useDebounce } from "@/renderer/hooks/utils";

export interface TableToolbarProps<
  TData extends RowData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TableFeature, TData>;
  searchColumn?: string;
  searchPlaceholder?: string;
  resetButtonLabel?: string;
  debounceMs?: number;
}

/**
 * Renders the top toolbar containing a debounced search input and table display controls.
 * @param props - Component configuration including table instance and search options.
 * @returns The rendered toolbar layout.
 */
export function TableToolbar<TData extends RowData>({
  table,
  searchColumn,
  searchPlaceholder = "Filtrer...",
  resetButtonLabel = "Réinitialiser",
  debounceMs = 300,
  className,
  children,
  ...props
}: TableToolbarProps<TData>) {
  const isFiltered = table.store.state.columnFilters.length > 0;
  const column = searchColumn ? table.getColumn(searchColumn) : undefined;
  const columnFilterValue = (column?.getFilterValue() as string) ?? "";

  const [inputValue, setInputValue] = React.useState<string>(columnFilterValue);
  const debouncedInputValue = useDebounce(inputValue, debounceMs);

  React.useEffect(() => {
    setInputValue(columnFilterValue);
  }, [columnFilterValue]);

  React.useEffect(() => {
    if (column) {
      column.setFilterValue(debouncedInputValue);
    }
  }, [debouncedInputValue, column]);

  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {column && (
          <Input
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="h-9 w-37.5 lg:w-62.5"
          />
        )}
        {children}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 text-xs px-2 lg:px-3 text-muted-foreground hover:text-foreground"
          >
            {resetButtonLabel}
            <X className="ml-2 size-3.5" />
          </Button>
        )}
      </div>
      <TableColumnVisibility table={table} />
    </div>
  );
}

TableToolbar.displayName = "TableToolbar";
