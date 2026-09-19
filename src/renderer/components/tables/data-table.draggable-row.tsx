"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, RowData, type Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/renderer/components/ui/table";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@/renderer/utils";
import { useCallback } from "react";
import { TableFeature } from "./hooks";

export type DraggableRowProps<T extends RowData> = {
  row: Row<TableFeature, T>;
  rowOriginalId: UniqueIdentifier;
  onRowClick?: (row: Row<TableFeature, T>) => void;
};

/**
 * A specialized table row component that supports drag-and-drop reordering.
 * @param props - Table row data, strict unique ID, and optional click handler.
 * @returns The draggable table row component.
 */
export function DraggableRow<T extends RowData>({
  row,
  rowOriginalId,
  onRowClick,
}: DraggableRowProps<T>) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: rowOriginalId,
  });
  const handleClick = useCallback(() => onRowClick?.(row), [onRowClick, row]);

  return (
    <TableRow
      data-state={row.getIsSelected() ? "selected" : undefined}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        "relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 select-none",
        !!onRowClick && "cursor-pointer",
      )}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      onClick={handleClick}
    >
      {row.getVisibleCells().map((cell) => {
        const isActionColumn = cell.column.id === "actions";
        const isSelectColumn = cell.column.id === "select";

        return (
          <TableCell
            key={cell.id}
            className={cn(
              "p-2 text-xs h-10",
              isActionColumn && "w-15 text-center min-w-15 max-w-15",
              isSelectColumn && "w-10 text-center",
              !isActionColumn && !isSelectColumn && "w-auto",
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
