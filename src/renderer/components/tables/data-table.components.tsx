"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { flexRender, Row } from "@tanstack/react-table"
import { TableCell, TableRow } from "@/renderer/components/ui/table"
import type { UniqueIdentifier } from "@dnd-kit/core"
import { cn } from "@/renderer/utils"
import { useCallback } from "react"


type DraggableRowProps<T> = {
    row: Row<T>,
    rowOriginalId: UniqueIdentifier,
    onClick?(row: Row<T>): void
}

export function DraggableRow<T>({ row, rowOriginalId: id, onClick }: DraggableRowProps<T>) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({ id })
    const handleClick = useCallback(() => { onClick?.(row) }, [row])
    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className={cn("relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80", !!onClick && "cursor-pointer")}
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
            onClick={handleClick}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell className="p-2 text-xs" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}