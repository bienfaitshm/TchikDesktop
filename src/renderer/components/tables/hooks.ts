"use client";

import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  useTable,
  tableFeatures,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  RowData,
} from "@tanstack/react-table";
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools";

import { TableActionHandler } from "./utils";

/**
 * @interface UseTableOptions
 * @template TData The type of the data rows in the table.
 * @description Options for the `useDataTable` hook.
 * @property {TData[]} initialData - The initial dataset for the table.
 * @property {ColumnDef<TData>[]} columns - The column definitions for the table, compatible with `@tanstack/react-table`.
 * @property {(item: TData) => string} keyExtractor - A function that returns a unique string identifier for each data item.
 * This is crucial for features like row selection and drag-and-drop.
 */

// 1. Configuration V9 de tableFeatures avec l'ensemble des slots requis
const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  // Slots de Row Models V9
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
});

export type TableFeature = typeof features;
export interface UseTableOptions<TData extends RowData> {
  initialData: TData[];
  columns: ColumnDef<TableFeature, TData>[];
  keyExtractor: (item: TData) => string;
}

export function useDataTable<TData extends RowData>({
  initialData: data,
  columns,
  keyExtractor,
}: UseTableOptions<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const state = React.useMemo(
    () => ({
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    }),
    [sorting, columnVisibility, rowSelection, columnFilters, pagination],
  );

  const rowIds = React.useMemo(
    () => data.map(keyExtractor),
    [data, keyExtractor],
  );

  // 2. Instanciation via useTable V9
  const tableInstance = useTable({
    key: "users-table",
    features,
    data,
    columns,
    state,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (row) => keyExtractor(row),
  });

  useTanStackTableDevtools(tableInstance);

  return {
    tableInstance,
    columns,
    rowIds,
    keyExtractor,
  } as const;
}

export function useTableActionController() {
  const handlerRef = React.useRef<TableActionHandler>(new TableActionHandler());
  return handlerRef.current;
}
