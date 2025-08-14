"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { flexRender, Row } from "@tanstack/react-table"
import { TableCell, TableRow } from "@/renderer/components/ui/table"
import type { UniqueIdentifier } from "@dnd-kit/core"


type DraggableRowProps<T> = {
    row: Row<T>,
    rowOriginalId: UniqueIdentifier
}

export function DraggableRow<T>({ row, rowOriginalId: id }: DraggableRowProps<T>) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({ id })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell className="p-2 text-xs" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}