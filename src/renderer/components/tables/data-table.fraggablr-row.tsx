"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, RowData, type Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/renderer/components/ui/table";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { cn } from "@/renderer/utils";
import { useCallback } from "react";
import { TableFeature } from "./hooks";

type DraggableRowProps<T extends RowData> = {
  row: Row<TableFeature, T>;
  rowOriginalId: UniqueIdentifier;
  onRowClick?(row: Row<TableFeature, T>): void;
};

export function DraggableRow<T extends RowData>({
  row,
  rowOriginalId: id,
  onRowClick,
}: DraggableRowProps<T>) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id });

  const handleClick = useCallback(() => {
    onRowClick?.(row);
  }, [onRowClick, row]);

  const visibleCells = row.getVisibleCells();

  return (
    <TableRow
      data-state={row.getIsSelected() ? "selected" : undefined}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={cn(
        "relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 select-none",
        !!onRowClick && "cursor-pointer",
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition,
      }}
      onClick={handleClick}
    >
      {visibleCells.map((cell) => {
        const isActionColumn = cell.column.id === "actions";
        const isSelectColumn = cell.column.id === "select";

        return (
          <TableCell
            key={cell.id}
            className={cn(
              "p-2 text-xs h-10",
              // Si c'est l'action, on lui donne une taille fixe minimale et on l'aligne à droite
              isActionColumn && "w-15 text-center min-w-15 max-w-15",
              // Si c'est la checkbox de sélection, taille fixe aussi
              isSelectColumn && "w-10 text-center",
              // Pour les autres colonnes, on les laisse prendre le reste de l'espace de manière stable
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
