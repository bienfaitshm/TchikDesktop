"use client"

import * as React from "react"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/renderer/components/ui/button"
import { Label } from "@/renderer/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select"
import { cn } from "@/renderer/utils"

const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 80]

export interface TablePaginationProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
    table: Table<TData>
    pageSizeOptions?: number[]
}

export function TablePagination<TData>({
    table,
    className,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    ...props
}: TablePaginationProps<TData>) {
    if (!table) return null

    const { pageIndex, pageSize } = table.getState().pagination
    const pageCount = table.getPageCount()
    const selectedRows = table.getFilteredSelectedRowModel().rows.length
    const totalRows = table.getFilteredRowModel().rows.length

    return (
        <div
            className={cn("flex items-center justify-between px-2 py-4", className)}
            {...props}
        >
            {/* Statistiques de sélection (Desktop) */}
            <div className="flex-1 text-sm text-muted-foreground hidden lg:block">
                {selectedRows > 0 ? (
                    <p>
                        {selectedRows} sur {totalRows} ligne(s) sélectionnée(s)
                    </p>
                ) : (
                    <p>{totalRows} ligne(s) au total</p>
                )}
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8 w-full lg:w-auto">
                {/* Sélecteur de taille de page */}
                <div className="flex items-center gap-2">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
                        Lignes par page
                    </Label>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]" id="rows-per-page">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Indicateur de position (Format: 1 sur 10) */}
                <div className="flex min-w-[100px] items-center justify-center text-sm font-medium">
                    Page {pageCount > 0 ? pageIndex + 1 : 0} sur {pageCount}
                </div>

                {/* Navigation par boutons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Première page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Page précédente</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Page suivante</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Dernière page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

TablePagination.displayName = "TablePagination"