"use client";

import * as React from "react";
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

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

// Assuming TableActionHandler is defined in "./utils"
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

/**
 * @function useDataTable
 * @template TData The type of the data rows in the table.
 * @description A comprehensive hook for managing table state and interactions, including sorting, filtering,
 * pagination, column visibility, row selection, and drag-and-drop reordering. It integrates
 * `@tanstack/react-table` for core table functionalities and `@dnd-kit` for drag-and-drop.
 * @param {UseTableOptions<TData>} { initialData, columns, keyExtractor } - Options for configuring the table.
 * @returns {object} An object containing table utilities and state:
 * - `dndId`: A unique ID for DND-related contexts.
 * - `dndSensors`: Configured DND sensors for mouse, touch, and keyboard interactions.
 * - `handleRowDragEnd`: A handler function for `DragEndEvent` from `@dnd-kit/core` to reorder rows.
 * - `tableInstance`: The instance returned by `useReactTable`, providing access to all table APIs.
 * - `columns`: The column definitions used by the table.
 * - `rowIds`: An array of unique identifiers for all rows, derived from `keyExtractor`.
 * - `keyExtractor`: The function used to extract unique keys from data items.
 *
 * @example
 * ```tsx
 * import React from "react";
 * import {
 * DndContext,
 * closestCenter,
 * KeyboardSensor,
 * PointerSensor,
 * useSensor,
 * useSensors,
 * } from "@dnd-kit/core";
 * import {
 * SortableContext,
 * verticalListSortingStrategy,
 * useSortable,
 * } from "@dnd-kit/sortable";
 * import { CSS } from "@dnd-kit/utilities";
 * import { flexRender } from "@tanstack/react-table";
 * import {
 * Table,
 * TableBody,
 * TableCell,
 * TableHead,
 * TableHeader,
 * TableRow,
 * } from "@/renderer/components/ui/table"; // Assuming shadcn/ui table components
 *
 * interface MyDataItem {
 * id: string;
 * name: string;
 * age: number;
 * }
 *
 * const initialData: MyDataItem[] = [
 * { id: "1", name: "Alice", age: 30 },
 * { id: "2", name: "Bob", age: 24 },
 * { id: "3", name: "Charlie", age: 35 },
 * ];
 *
 * const columns: ColumnDef<MyDataItem>[] = [
 * {
 * accessorKey: "name",
 * header: "Name",
 * },
 * {
 * accessorKey: "age",
 * header: "Age",
 * },
 * ];
 *
 * const DraggableRow = ({ row }: { row: any }) => {
 * const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
 * id: row.id,
 * });
 *
 * const style = {
 * transform: CSS.Transform.toString(transform),
 * transition,
 * zIndex: isDragging ? 1 : 0,
 * position: isDragging ? 'relative' : 'static', // Keep original position
 * opacity: isDragging ? 0.5 : 1,
 * };
 *
 * return (
 * <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
 * {row.getVisibleCells().map((cell: any) => (
 * <TableCell key={cell.id}>
 * {flexRender(cell.column.columnDef.cell, cell.getContext())}
 * </TableCell>
 * ))}
 * </TableRow>
 * );
 * };
 *
 * export function MyDataTable() {
 * const { dndId, dndSensors, handleRowDragEnd, tableInstance, rowIds } = useDataTable({
 * initialData,
 * columns,
 * keyExtractor: (item) => item.id,
 * });
 *
 * return (
 * <DndContext id={dndId} sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleRowDragEnd}>
 * <div className="rounded-md border">
 * <Table>
 * <TableHeader>
 * {tableInstance.getHeaderGroups().map((headerGroup) => (
 * <TableRow key={headerGroup.id}>
 * {headerGroup.headers.map((header) => (
 * <TableHead key={header.id}>
 * {header.isPlaceholder
 * ? null
 * : flexRender(header.column.columnDef.header, header.getContext())}
 * </TableHead>
 * ))}
 * </TableRow>
 * ))}
 * </TableHeader>
 * <TableBody>
 * <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
 * {tableInstance.getRowModel().rows?.length ? (
 * tableInstance.getRowModel().rows.map((row) => (
 * <DraggableRow key={row.id} row={row} />
 * ))
 * ) : (
 * <TableRow>
 * <TableCell colSpan={columns.length} className="h-24 text-center">
 * No results.
 * </TableCell>
 * </TableRow>
 * )}
 * </SortableContext>
 * </TableBody>
 * </Table>
 * </div>
 * </DndContext>
 * );
 * }
 * ```
 */
export function useDataTable<TData>({
  initialData,
  columns,
  keyExtractor,
}: UseTableOptions<TData>) {
  const [data, setData] = React.useState(initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Use a stable ID for DndContext
  const dndId = React.useId();
  // Configure Dnd-kit sensors
  const dndSensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Memoize row IDs for DND-kit SortableContext
  const rowIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(keyExtractor) || [],
    [data, keyExtractor] // Add keyExtractor to dependencies
  );

  // Initialize @tanstack/react-table
  const tableInstance = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => keyExtractor(row), // Ensure row IDs are derived consistently
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  /**
   * @function handleRowDragEnd
   * @description Handles the `onDragEnd` event from `@dnd-kit/core` to reorder the table data.
   * It updates the internal `data` state based on the drag and drop operation.
   * @param {DragEndEvent} event - The drag end event object from `@dnd-kit/core`.
   */
  const handleRowDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active && over && active.id !== over.id) {
        setData((currentData) => {
          const oldIndex = rowIds.indexOf(active.id);
          const newIndex = rowIds.indexOf(over.id);
          return arrayMove(currentData, oldIndex, newIndex);
        });
      }
    },
    [rowIds] // Depend on rowIds to ensure correct index calculations
  );

  return {
    dndId,
    dndSensors,
    handleRowDragEnd,
    tableInstance,
    columns, // Include columns for convenience
    rowIds, // Include rowIds for SortableContext
    keyExtractor, // Include keyExtractor for clarity/potential external use
  } as const;
}

/**
 * @function useTableActionController
 * @description A hook to get a stable instance of `TableActionHandler`.
 * This handler is typically used to perform actions like triggering a reload
 * or other side effects related to the table data management,
 * independent of the table's rendering.
 * @returns {TableActionHandler} A singleton instance of `TableActionHandler`.
 *
 * @example
 * ```typescript
 * import { useTableActionController } from "@/path/to/this/file";
 *
 * const MyComponent = () => {
 * const tableActions = useTableActionController();
 *
 * const handleReload = () => {
 * tableActions.reload(); // Assuming a 'reload' method exists on TableActionHandler
 * };
 *
 * return <button onClick={handleReload}>Reload Table Data</button>;
 * };
 * ```
 */
export function useTableActionController() {
  const handlerRef = React.useRef<TableActionHandler>(new TableActionHandler());
  return handlerRef.current;
}
