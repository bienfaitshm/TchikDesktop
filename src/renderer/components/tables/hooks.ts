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

// export function useDataTable<TData>({
//   initialData,
//   columns,
//   keyExtractor,
// }: UseTableOptions<TData>) {
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     [],
//   );
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   const data = React.useMemo(() => initialData || [], [initialData]);

//   const dndId = React.useId();
//   const dndSensors = useSensors(
//     useSensor(MouseSensor),
//     useSensor(TouchSensor),
//     useSensor(KeyboardSensor),
//   );

//   const rowIds = React.useMemo(
//     () => data.map(keyExtractor),
//     [data, keyExtractor],
//   );

//   const tableInstance = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       columnFilters,
//       pagination,
//     },
//     onRowSelectionChange: setRowSelection,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onPaginationChange: setPagination,

//     getRowId: (row) => keyExtractor(row),
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//   });

//   /**
//    * @function handleRowDragEnd
//    * @description Handles the `onDragEnd` event from `@dnd-kit/core` to reorder the table data.
//    * It updates the internal `data` state based on the drag and drop operation.
//    * @param {DragEndEvent} event - The drag end event object from `@dnd-kit/core`.
//    */
//   const handleRowDragEnd = React.useCallback(
//     (event: DragEndEvent) => {
//       const { active, over } = event;
//       if (active && over && active.id !== over.id) {
//         // setData((currentData) => {
//         //   const oldIndex = rowIds.indexOf(active.id);
//         //   const newIndex = rowIds.indexOf(over.id);
//         //   return arrayMove(currentData, oldIndex, newIndex);
//         // });
//       }
//     },
//     [rowIds],
//   );

//   return {
//     dndId,
//     dndSensors,
//     handleRowDragEnd,
//     tableInstance,
//     columns, // Include columns for convenience
//     rowIds, // Include rowIds for SortableContext
//     keyExtractor, // Include keyExtractor for clarity/potential external use
//   } as const;
// }

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

  // const prevInitialDataRef = React.useRef(initialData);
  // const [data, setData] = React.useState(initialData);
  // React.useEffect(() => {
  //   if (initialData !== prevInitialDataRef.current) {
  //     prevInitialDataRef.current = initialData;
  //     setData(initialData);
  //   }
  // }, [initialData]);

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
