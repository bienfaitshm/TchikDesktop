"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import type { Table, Column } from "@tanstack/react-table";

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

interface TableColumnVisibilityProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

/**
 * Récupère un libellé propre et lisible pour l'option de visibilité de la colonne.
 */
function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header;

  if (typeof header === "string") {
    return header;
  }

  const customMeta = column.columnDef.meta as { label?: string } | undefined;
  if (customMeta?.label) {
    return customMeta.label;
  }

  const fallback = column.id;
  const humanized = fallback.replace(/_/g, " ").replace(/([A-Z])/g, " $1");
  return humanized.charAt(0).toUpperCase() + humanized.slice(1).trim();
}

export function TableColumnVisibility<TData>({
  table,
  className,
}: TableColumnVisibilityProps<TData>) {
  const maskableColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
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
              "ml-auto hidden lg:flex gap-2 items-center",
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
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground tracking-wider">
            Colonnes visibles
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {maskableColumns.map((column) => {
            const cleanLabel = getColumnLabel(column);

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="cursor-pointer text-sm"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                <span className="truncate">{cleanLabel}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

TableColumnVisibility.displayName = "TableColumnVisibility";
