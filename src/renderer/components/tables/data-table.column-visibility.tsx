"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import type { Table, Column, RowData } from "@tanstack/react-table";
import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/renderer/components/ui/dropdown-menu";
import { cn } from "@/renderer/utils";
import { TableFeature } from "./hooks";

export interface TableColumnVisibilityProps<
  TData extends RowData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TableFeature, TData>;
}

/**
 * Generates a human-readable label from column definition or falls back to column ID.
 * @param column - The table column instance.
 * @returns A formatted string label for the column.
 */
function getColumnLabel<TData extends RowData>(
  column: Column<TableFeature, TData, unknown>,
): string {
  const header = column.columnDef.header;
  if (typeof header === "string") return header;

  const customMeta = column.columnDef.meta as { label?: string } | undefined;
  if (customMeta?.label) return customMeta.label;

  const humanized = column.id.replace(/_/g, " ").replace(/([A-Z])/g, " $1");
  return humanized.charAt(0).toUpperCase() + humanized.slice(1).trim();
}

/**
 * Provides a dropdown menu to toggle the visibility of maskable table columns.
 * @param props - Contains the table instance to manage column visibility.
 * @returns The visibility toggle dropdown component.
 */
export function TableColumnVisibility<TData extends RowData>({
  table,
  className,
}: TableColumnVisibilityProps<TData>) {
  const maskableColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            (column.accessorFn != null || column.id != null) &&
            column.getCanHide(),
        ),
    [table],
  );

  if (maskableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "ml-auto h-8 rounded-full text-xs hidden lg:flex gap-2 items-center",
              className,
            )}
          />
        }
      >
        <Settings2 className="h-4 w-4" />
        <span>Affichage</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            Colonnes visibles
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {maskableColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="cursor-pointer text-xs"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              <span className="truncate">{getColumnLabel(column)}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

TableColumnVisibility.displayName = "TableColumnVisibility";
