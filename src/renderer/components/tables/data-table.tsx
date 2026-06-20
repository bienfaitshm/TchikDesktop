"use client";
import React, { createContext, useContext } from "react";
import {
  Table as TanstackTable,
  ColumnDef,
  flexRender,
  Row,
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
import { useDataTable } from "./hooks";
import { DraggableRow } from "./data-table.fraggablr-row";
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

type ContextTable<T> = {
  dndId: string;
  dndSensors: SensorDescriptor<SensorOptions>[];
  handleRowDragEnd: (event: DragEndEvent) => void;
  tableInstance: TanstackTable<T>;
  columns: ColumnDef<T>[];
  rowIds: UniqueIdentifier[];
  keyExtractor: (item: T) => string;
  // setData: React.Dispatch<React.SetStateAction<T[]>>;
};

const DataTableContext = createContext<ContextTable<any> | null>(null);

function useDataTableContext() {
  return useContext(DataTableContext);
}

export type DataTableProps<T> = {
  data: T[];
  keyExtractor: (value: T) => string;
  columns: ColumnDef<T>[];
  children?: React.ReactNode;
};

export type DataTableRef = {
  updateData(): void;
};

export function DataTable<T>({
  data,
  keyExtractor,
  columns,
  children,
}: DataTableProps<T> & { children?: React.ReactNode }) {
  const contextValue = useDataTable({
    initialData: data,
    keyExtractor,
    columns,
  });
  return (
    <DataTableContext.Provider value={contextValue}>
      {children}
    </DataTableContext.Provider>
  );
}

export function DataTableContent({ children }: { children?: React.ReactNode }) {
  const ctx = useDataTableContext();
  return (
    <div className="overflow-hidden rounded-lg border">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={ctx?.handleRowDragEnd}
        sensors={ctx?.dndSensors}
        id={ctx?.dndId}
      >
        <TableView>{children}</TableView>
      </DndContext>
    </div>
  );
}

export function DataContentHead(props?: { className?: string }) {
  const ctx = useDataTableContext();
  const headerGroups = ctx?.tableInstance?.getHeaderGroups() ?? [];
  return (
    <TableHeader className={cn("sticky top-0 z-10 bg-muted", props?.className)}>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id} colSpan={header.colSpan}>
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

interface RowComponentProps<T> {
  row: Row<T>;
  rowOriginalId: string | number;
  onRowClick?: (row: Row<T>) => void;
}

interface DataContentBodyProps<T> {
  onRowClick?: (row: Row<T>) => void;
  children?: (props: RowComponentProps<T>) => React.ReactNode;
}

export function DataContentBody<T>({
  onRowClick,
  children = (props) => <DraggableRow {...props} />,
}: DataContentBodyProps<T>) {
  const ctx = useDataTableContext();

  const rows = ctx?.tableInstance?.getRowModel().rows ?? [];
  const rowIds = ctx?.rowIds ?? [];

  return (
    <TableBody className="[&_[data-slot=table-cell]:first-child]:w-8">
      {rows.length > 0 ? (
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {rows.map((row) => {
            const rowOriginalId = ctx!.keyExtractor(row.original);
            return (
              <React.Fragment key={row.id}>
                {children({ row, onRowClick, rowOriginalId })}
              </React.Fragment>
            );
          })}
        </SortableContext>
      ) : (
        <TableRow>
          <TableCell
            colSpan={ctx?.columns.length}
            className="h-24 text-center text-muted-foreground"
          >
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

interface DataTablePaginationProps {}

/**
 * DataTablePagination
 * Composant "Smart" connecté au DataTableContext.
 * Il injecte automatiquement l'instance de la table dans le composant de pagination UI.
 */
export function DataTablePagination({
  pageSizeOptions,
  className,
  ...props
}: DataTablePaginationProps & Omit<TablePaginationProps<any>, "table">) {
  const ctx = useDataTableContext();
  const table = ctx?.tableInstance;

  if (!table) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "DataTablePagination must be used within a DataTableProvider. Rendering null.",
      );
    }
    return null;
  }

  return (
    <TablePagination
      {...props}
      table={table}
      pageSizeOptions={pageSizeOptions}
      className={className}
    />
  );
}

DataTablePagination.displayName = "DataTablePagination";

interface DataTableColumnToggleProps {
  className?: string;
}

/**
 * DataTableColumnToggle
 * Composant "Smart" connecté au contexte pour gérer la visibilité des colonnes.
 */
export function DataTableColumnToggle({
  className,
}: DataTableColumnToggleProps) {
  const ctx = useDataTableContext();
  const table = ctx?.tableInstance;

  if (!table) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "DataTableColumnToggle: table instance not found in context.",
      );
    }
    return null;
  }

  return <TableColumnVisibility table={table} className={className} />;
}

DataTableColumnToggle.displayName = "DataTableColumnToggle";

/**
 * DataTableToolbar
 */
export const DataTableToolbar: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 mb-4", className)}
      {...props}
    />
  );
};

DataTableToolbar.displayName = "DataTableToolbar";

export type SearchTableToolbarProps = {
  searchColumn?: string;
};
export const SearchTableToolbar: React.FC<
  SearchTableToolbarProps & React.ComponentProps<"input">
> = ({ searchColumn, ...props }) => {
  const ctx = useDataTableContext();
  const table = ctx?.tableInstance;

  if (!table) {
    return null;
  }
  return (
    <>
      {searchColumn && table.getColumn(searchColumn) && (
        <Input
          {...props}
          value={
            (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
          }
          className="h-9 w-37.5 lg:w-62.5"
        />
      )}
    </>
  );
};

export const FilteredTableToolbarContainer: React.FC<
  React.ComponentProps<"div">
> = ({ children, className, ...props }) => {
  const ctx = useDataTableContext();
  const table = ctx?.tableInstance;

  if (!table) {
    return null;
  }

  const isFiltered = table.getState().columnFilters.length > 0;
  return (
    <div {...props} className={cn("flex flex-1 items-center gap-2", className)}>
      {children}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
        >
          Réinitialiser
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

interface TableFacetedFilterItemProps {
  /** L'ID de la colonne dans TanStack Table (ex: "category", "status") */
  columnId: string;
  /** Le titre affiché dans le bouton du filtre */
  title: string;
  /** Les options de filtrage */
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

/**
 * TableFacetedFilterItem
 */
export function TableFacetedFilterItem({
  columnId,
  title,
  options,
}: TableFacetedFilterItemProps) {
  const ctx = useDataTableContext();
  const table = ctx?.tableInstance;

  if (!table) return null;
  const column = table.getColumn(columnId);
  if (!column) {
    console.warn(
      `TableFacetedFilterItem: Column "${columnId}" not found in table instance.`,
    );
    return null;
  }

  return <TableFacetedFilter column={column} title={title} options={options} />;
}

TableFacetedFilterItem.displayName = "TableFacetedFilterItem";
