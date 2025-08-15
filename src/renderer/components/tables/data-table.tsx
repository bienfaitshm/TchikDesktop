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
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Label } from "@/renderer/components/ui/label";
import {
    Table as TableView,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/renderer/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { Button } from "@/renderer/components/ui/button";
import { useDataTable } from "./hooks";
import { DraggableRow } from "./data-table.components";

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
    const contextValue = useDataTable({ initialData: data, keyExtractor, columns });
    // React.useEffect(() => {
    //     contextValue.setData(data)
    // }, [data])
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

export function DataContentHead() {
    const ctx = useDataTableContext();
    const headerGroups = ctx?.tableInstance?.getHeaderGroups() ?? [];
    return (
        <TableHeader className="sticky top-0 z-10 bg-muted">
            {headerGroups.map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                    ))}
                </TableRow>
            ))}
        </TableHeader>
    );
}

interface DataContentBodyProps<T> {
    onClick?(row: Row<T>): void
}
export function DataContentBody<T>(props?: DataContentBodyProps<T>) {
    const ctx = useDataTableContext();
    const rows = ctx?.tableInstance?.getRowModel().rows ?? [];
    return (
        <TableBody className="[&_[data-slot=table-cell]:first-child]:w-8">
            {rows.length ? (
                <SortableContext
                    items={ctx!.rowIds}
                    strategy={verticalListSortingStrategy}
                >
                    {rows.map((row) => (
                        <DraggableRow
                            onClick={props?.onClick}
                            key={row.id}
                            rowOriginalId={ctx!.keyExtractor(row.original)}
                            row={row}
                        />
                    ))}
                </SortableContext>
            ) : (
                <TableRow>
                    <TableCell colSpan={ctx?.columns.length} className="h-24 text-center">
                        No results.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
}

export function DataTablePagination() {
    const ctx = useDataTableContext();
    const table = ctx?.tableInstance;
    if (!table) return null;

    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();

    return (
        <div className="mt-5 flex items-center justify-between">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} sur{" "}
                {table.getFilteredRowModel().rows.length} ligne(s) sélectionné(s).{" "}
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        Lignes par page
                    </Label>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-20" id="rows-per-page">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50, 80].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Page {pageIndex + 1} sur {pageCount}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function DataTableColumnFilter() {
    const ctx = useDataTableContext();
    const table = ctx?.tableInstance;
    if (!table) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2" />
                    <span className="hidden lg:inline">Personnaliser les colonnes</span>
                    <span className="lg:hidden">Colonnes</span>
                    <ChevronDown className="ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Sélectionnez les colonnes à afficher
                </div>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" && column.getCanHide()
                    )
                    .map((column) => (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                            {column.id}
                        </DropdownMenuCheckboxItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}