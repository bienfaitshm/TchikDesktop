"use client";

import * as React from "react";
// import {
//   KeyboardSensor,
//   MouseSensor,
//   TouchSensor,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
// } from "@dnd-kit/core";

import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

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
export interface UseTableOptions<TData> {
  initialData: TData[];
  columns: ColumnDef<TData>[];
  keyExtractor: (item: TData) => string;
}

export function useDataTable<TData>({
  initialData: data,
  columns,
  keyExtractor,
}: UseTableOptions<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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

  const tableInstance = useReactTable({
    data,
    columns,
    state,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId: (row) => keyExtractor(row),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

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
