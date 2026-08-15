"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/renderer/components/ui/button";
import { Label } from "@/renderer/components/ui/label";
import {
  SelectInput,
  Option,
} from "@/renderer/components/form/fields/select-input";
import { cn } from "@/renderer/utils";

const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 80];
const SELECT_PAGE_SIZE_OPTIONS: Option[] = DEFAULT_PAGE_SIZES.map((sz) => ({
  label: sz.toString(),
  value: sz.toString(),
}));

export interface TablePaginationProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function TablePagination<TData>({
  table,
  className,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  ...props
}: TablePaginationProps<TData>) {
  if (!table) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  const formattedSelected = selectedRows.toLocaleString("fr-FR");
  const formattedTotal = totalRows.toLocaleString("fr-FR");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between text-xs gap-4 px-2 py-4 sm:flex-row",
        className,
      )}
      {...props}
    >
      {/* Statistiques de sélection */}
      <div className="text-xs mr-4 text-muted-foreground w-full text-center sm:w-auto sm:text-left">
        {selectedRows > 0 ? (
          <p>
            <span className="font-medium text-foreground">
              {formattedSelected}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-foreground">
              {formattedTotal}
            </span>{" "}
            ligne(s) sélectionnée(s)
          </p>
        ) : (
          <p>
            <span className="font-medium text-foreground">
              {formattedTotal}
            </span>{" "}
            ligne(s) au total
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        {/* Sélecteur de taille de page */}
        <div className="flex items-center gap-2">
          <Label
            htmlFor="rows-per-page"
            className="text-xs font-medium whitespace-nowrap"
          >
            Lignes par page
          </Label>
          <SelectInput
            options={SELECT_PAGE_SIZE_OPTIONS}
            value={pageSize.toString()}
            onChange={(value) => table.setPageSize(Number(value))}
          />
        </div>

        {/* Indicateur de position */}
        <div className="flex min-w-25 items-center justify-center text-xs font-medium">
          Page {pageCount > 0 ? pageIndex + 1 : 0} sur {pageCount}
        </div>

        {/* Navigation par boutons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Première page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Dernière page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

TablePagination.displayName = "TablePagination";
