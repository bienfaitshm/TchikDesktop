"use client"

import * as React from "react"
import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/renderer/components/ui/button"
import { Input } from "@/renderer/components/ui/input"
import { cn } from "@/renderer/utils"

import { TableColumnVisibility } from "./data-table.column-visibility"

interface TableToolbarProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
    table: Table<TData>
    searchColumn?: string;
    searchPlaceholder?: string
}

export function TableToolbar<TData>({
    table,
    searchColumn,
    searchPlaceholder = "Filtrer...",
    className,
    children,
    ...props
}: TableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div
            className={cn("flex items-center justify-between gap-4", className)}
            {...props}
        >
            <div className="flex flex-1 items-center gap-2">
                {/* Filtre de recherche principal */}
                {searchColumn && table.getColumn(searchColumn) && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}

                {children}

                {/* Bouton de réinitialisation */}
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

            {/* Options de visibilité des colonnes */}
            <TableColumnVisibility table={table} />
        </div>
    )
}

TableToolbar.displayName = "TableToolbar"