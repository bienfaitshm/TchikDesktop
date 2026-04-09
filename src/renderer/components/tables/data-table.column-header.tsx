"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"
import { type Column } from "@tanstack/react-table"

import { cn } from "@/renderer/utils"
import { Button } from "@/renderer/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu"

interface TableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}

export function TableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: TableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn("text-xs font-semibold", className)}>{title}</div>
    }

    const sortedState = column.getIsSorted()

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "-ml-3 h-8 data-[state=open]:bg-accent hover:bg-accent/50 text-xs font-semibold",
                            sortedState && "text-foreground"
                        )}
                    >
                        <span>{title}</span>
                        {sortedState === "desc" ? (
                            <ArrowDown className="ml-2 h-3.5 w-3.5" />
                        ) : sortedState === "asc" ? (
                            <ArrowUp className="ml-2 h-3.5 w-3.5" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[160px]">
                    <DropdownMenuItem
                        onClick={() => column.toggleSorting(false)}
                        className={cn(sortedState === "asc" && "bg-accent font-medium")}
                    >
                        <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Croissant
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => column.toggleSorting(true)}
                        className={cn(sortedState === "desc" && "bg-accent font-medium")}
                    >
                        <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Décroissant
                    </DropdownMenuItem>

                    {column.getCanHide() && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                                <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Masquer
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

TableColumnHeader.displayName = "TableColumnHeader"