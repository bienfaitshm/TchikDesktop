"use client";

import React, { createContext, useContext } from "react";
import {
  Table as TanstackTable,
  ColumnDef,
  flexRender,
  Row,
  RowData,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Table as TableView,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table";
import { useDataTable, TableFeature } from "./hooks";
import { DraggableRow } from "./data-table.draggable-row";
import { cn } from "@/renderer/utils";
import { TableFacetedFilter } from "./data-table.faceted-filter";
import {
  TablePagination,
  type TablePaginationProps,
} from "./data-table.pagination";
import { TableColumnVisibility } from "./data-table.column-visibility";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export type ContextTable<T extends RowData> = {
  dndId?: string;
  dndSensors?: SensorDescriptor<SensorOptions>[];
  handleRowDragEnd?: (event: DragEndEvent) => void;
  tableInstance: TanstackTable<TableFeature, T>;
  columns: ColumnDef<TableFeature, T>[];
  rowIds: UniqueIdentifier[];
  keyExtractor: (item: T) => string;
};

// We use `any` initially but assert it in the strict hook to maintain type safety over generic T.
const DataTableContext = createContext<ContextTable<any> | null>(null);

/**
 * Accesses the generic DataTable context and asserts its existence.
 * @returns The strongly-typed table context.
 */
function useDataTableContext<T extends RowData>(): ContextTable<T> {
  const context = useContext(DataTableContext);
  if (!context)
    throw new Error(
      "useDataTableContext must be used within a DataTableProvider",
    );
  return context;
}

export type DataTableProps<T extends RowData> = {
  data: T[];
  keyExtractor: (value: T) => string;
  columns: ColumnDef<TableFeature, T>[];
  children?: React.ReactNode;
};

/**
 * Root Provider wrapper initializing the table and sorting contexts.
 * @param props - Table data array, configurations, and children nodes.
 * @returns The contextual root table component.
 */
export function DataTable<T extends RowData>({
  data,
  keyExtractor,
  columns,
  children,
}: DataTableProps<T>) {
  const contextValue = useDataTable({
    initialData: data,
    keyExtractor,
    columns,
  });
  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="w-full min-w-0">{children}</div>
    </DataTableContext.Provider>
  );
}

/**
 * Encapsulates the core HTML Table layout while maintaining DND support constraints.
 */
export function DataTableContent({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ctx = useDataTableContext();
  return (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-x-auto rounded-lg border scrollbar-thin",
        className,
      )}
    >
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={ctx.handleRowDragEnd}
        sensors={ctx.dndSensors}
        id={ctx.dndId}
      >
        <TableView>{children}</TableView>
      </DndContext>
    </div>
  );
}

/**
 * Renders the primary header layer for the main active columns.
 */
export function DataContentHead({ className }: { className?: string }) {
  const ctx = useDataTableContext();
  const headerGroups = ctx.tableInstance.getHeaderGroups();
  return (
    <TableHeader className={cn("sticky top-0 z-10 bg-muted", className)}>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              className="text-xs"
              key={header.id}
              colSpan={header.colSpan}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

export interface RowComponentProps<T extends RowData> {
  row: Row<TableFeature, T>;
  rowOriginalId: string | number;
  onRowClick?: (row: Row<TableFeature, T>) => void;
}

export interface DataContentBodyProps<T extends RowData> {
  onRowClick?: (row: Row<TableFeature, T>) => void;
  children?: (props: RowComponentProps<T>) => React.ReactNode;
}

/**
 * Constructs the main table body rows, providing them context for DND.
 */
export function DataContentBody<T extends RowData>({
  onRowClick,
  children = (props) => <DraggableRow {...props} />,
}: DataContentBodyProps<T>) {
  const ctx = useDataTableContext<T>();
  const rows = ctx.tableInstance.getRowModel().rows;

  return (
    <TableBody className="w-full [&_[data-slot=table-cell]:first-child]:w-8 overflow-x-scroll scrollbar-thin">
      {rows.length > 0 ? (
        <SortableContext
          items={ctx.rowIds}
          strategy={verticalListSortingStrategy}
        >
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              {children({
                row,
                onRowClick,
                rowOriginalId: ctx.keyExtractor(row.original),
              })}
            </React.Fragment>
          ))}
        </SortableContext>
      ) : (
        <TableRow>
          <TableCell
            colSpan={ctx.columns.length}
            className="h-24 text-center text-muted-foreground"
          >
            Aucun résultat.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

/**
 * Thin wrapper providing strict context values for TablePagination features.
 */
export function DataTablePagination({
  pageSizeOptions,
  className,
  ...props
}: Omit<TablePaginationProps<any>, "table">) {
  const ctx = useDataTableContext();
  return (
    <TablePagination
      {...props}
      table={ctx.tableInstance}
      pageSizeOptions={pageSizeOptions}
      className={className}
    />
  );
}
DataTablePagination.displayName = "DataTablePagination";

/**
 * Thin wrapper supplying the current table context to the column toggler.
 */
export function DataTableColumnToggle({ className }: { className?: string }) {
  const ctx = useDataTableContext();
  return (
    <TableColumnVisibility table={ctx.tableInstance} className={className} />
  );
}
DataTableColumnToggle.displayName = "DataTableColumnToggle";

export const DataTableToolbar: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-between gap-4 mb-4",
      className,
    )}
    {...props}
  />
);
DataTableToolbar.displayName = "DataTableToolbar";

export type SearchTableToolbarProps = { searchColumn?: string };

/**
 * Renders an inline search input field bounded to a precise column key.
 */
export const SearchTableToolbar: React.FC<
  SearchTableToolbarProps & React.ComponentProps<"input">
> = ({ searchColumn, ...props }) => {
  const ctx = useDataTableContext();
  if (!searchColumn) return null;
  const column = ctx.tableInstance.getColumn(searchColumn);
  if (!column) return null;

  return (
    <Input
      {...props}
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(event) => column.setFilterValue(event.target.value)}
      className={cn(
        "text-xs placeholder:text-xs w-37.5 rounded-full lg:w-62.5 px-4",
        props.className,
      )}
    />
  );
};

/**
 * Manages the layout container embedding active filters and clear buttons.
 */
export const FilteredTableToolbarContainer: React.FC<
  React.ComponentProps<"div">
> = ({ children, className, ...props }) => {
  const ctx = useDataTableContext();
  const isFiltered = ctx.tableInstance.store.state.columnFilters.length > 0;

  return (
    <div
      {...props}
      className={cn("flex flex-1 items-center gap-2 flex-wrap", className)}
    >
      {children}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => ctx.tableInstance.resetColumnFilters()}
          className="h-8 text-xs px-2 lg:px-3 text-muted-foreground hover:text-foreground"
        >
          Réinitialiser <X className="ml-2 size-3.5" />
        </Button>
      )}
    </div>
  );
};

export interface TableFacetedFilterItemProps {
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

/**
 * Plugs a configured faceted filter onto a specified table column via contextual ID.
 */
export function TableFacetedFilterItem({
  columnId,
  title,
  options,
}: TableFacetedFilterItemProps) {
  const ctx = useDataTableContext();
  const column = ctx.tableInstance.getColumn(columnId);
  if (!column) return null;

  return <TableFacetedFilter column={column} title={title} options={options} />;
}
TableFacetedFilterItem.displayName = "TableFacetedFilterItem";
