"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { RowData, Table } from "@tanstack/react-table";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { cn } from "@/renderer/utils";
import { TableColumnVisibility } from "./data-table.column-visibility";
import { TableFeature } from "./hooks";
export interface TableToolbarProps<
  TData extends RowData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TableFeature, TData>;
  searchColumn?: string;
  searchPlaceholder?: string;
}

/**
 * Renders the top bar of the table containing a global search input and column visibility settings.
 * @param props - Contains table reference, optional column to search, and text placeholders.
 * @returns The toolbar component.
 */
export function TableToolbar<TData extends RowData>({
  table,
  searchColumn,
  searchPlaceholder = "Filtrer...",
  className,
  children,
  ...props
}: TableToolbarProps<TData>) {
  const isFiltered = table.store.state.columnFilters.length > 0;
  const column = searchColumn ? table.getColumn(searchColumn) : undefined;

  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {column && (
          <Input
            placeholder={searchPlaceholder}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
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
            Réinitialiser
            <X className="ml-2 size-3.5" />
          </Button>
        )}
      </div>
      <TableColumnVisibility table={table as any} />
    </div>
  );
}

TableToolbar.displayName = "TableToolbar";
