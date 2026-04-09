"use client"

import * as React from "react"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Settings2 } from "lucide-react"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/renderer/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/renderer/components/ui/dropdown-menu"
import { cn } from "@/renderer/utils"

interface TableColumnVisibilityProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
    table: Table<TData>
}

export function TableColumnVisibility<TData>({
    table,
    className,
}: TableColumnVisibilityProps<TData>) {
    const columns = React.useMemo(
        () =>
            table
                .getAllColumns()
                .filter(
                    (column) =>
                        typeof column.accessorFn !== "undefined" && column.getCanHide() && !column.columnDef.meta?.isInternal
                ),
        [table]
    )

    if (columns.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "ml-auto hidden h-8 lg:flex border-dashed",
                        className
                    )}
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Affichage
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Colonnes visibles
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {columns.map((column) => {
                    const label = typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id

                    return (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                            <span className="truncate">{label.replace(/_/g, " ")}</span>
                        </DropdownMenuCheckboxItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

TableColumnVisibility.displayName = "TableColumnVisibility"