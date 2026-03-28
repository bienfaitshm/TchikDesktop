"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React, { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { flexRender, Row } from "@tanstack/react-table"
import { TableCell, TableRow } from "@/renderer/components/ui/table"
import type { UniqueIdentifier } from "@dnd-kit/core"
import { cn } from "@/renderer/utils"
import { useCallback } from "react"
import { TypographyH1 } from "../ui/typography"

type DraggableRowProps<T> = {
    row: Row<T>,
    rowOriginalId: UniqueIdentifier,
    onRowClick?(row: Row<T>): void
}

export function DraggableRow<T>({ row, rowOriginalId: id, onRowClick }: DraggableRowProps<T>) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({ id })
    const handleClick = useCallback(() => { onRowClick?.(row) }, [row])
    return (
        <>
            <TableRow
                data-state={row.getIsSelected() && "selected"}
                data-dragging={isDragging}
                ref={setNodeRef}
                className={cn("relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80", !!onRowClick && "cursor-pointer")}
                style={{
                    transform: CSS.Transform.toString(transform),
                    transition: transition,
                }}
                onClick={handleClick}
            >
                {row.getVisibleCells().map((cell) => (
                    <>
                        <TableCell className="p-2 text-xs" key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    </>
                ))}
            </TableRow>
            <tr key={`${id}-infos-actions`}>
                <td colSpan={row.getVisibleCells().length} className="p-0 border-none">

                    <div>
                        <TypographyH1>Bonjour</TypographyH1>
                    </div>
                </td>
            </tr>
        </>
    )
}



/**
 * Interface générique pour les lignes extensibles.
 * T représente le schéma de données de la ligne.
 */
interface ExpandableRowProps<T> {
    row: Row<T>;
    detailContent?: React.ReactNode;
    onRowClick?: (row: Row<T>) => void;
    className?: string;
}

/**
 * ExpandableRow component 
 * Suit les standards de performance en utilisant React.memo et useCallback.
 */
const ExpandableRowInner = <T,>({
    row,
    detailContent,
    onRowClick,
    className,
}: ExpandableRowProps<T>) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const visibleColumnCount = useMemo(() => row.getVisibleCells().length + 1, [row]);

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded((prev) => !prev);
        onRowClick?.(row);
    }, [onRowClick, row]);

    return (
        <React.Fragment>
            <TableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
                aria-expanded={isExpanded}
                className={cn(
                    "group relative z-0 transition-colors hover:bg-muted/50",
                    "cursor-pointer",
                    className
                )}
                onClick={handleToggle}
            >
                {row.getVisibleCells().map((cell, idx) => (
                    <TableCell
                        key={cell.id}
                        className="p-3 text-xs md:text-sm font-medium"
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}

                {/* Colonne d'action dédiée au Chevron */}
                <TableCell className="text-right pr-4">
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="inline-flex items-center justify-center"
                    >
                        <ChevronDown size={18} className="text-muted-foreground group-hover:text-foreground" />
                    </motion.div>
                </TableCell>
            </TableRow>

            {/* Section Détails avec Animation style WhatsApp */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <tr className="border-none bg-muted/30">
                        <td colSpan={visibleColumnCount} className="p-0 border-none">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: "auto",
                                    opacity: 1,
                                    transition: { height: { duration: 0.3 }, opacity: { duration: 0.2, delay: 0.1 } }
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                    transition: { height: { duration: 0.25 }, opacity: { duration: 0.15 } }
                                }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 w-full">
                                    {detailContent || (
                                        <div className="text-sm text-center text-muted-foreground italic">
                                            Aucune information supplémentaire disponible.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </React.Fragment>
    );
};

export const ExpandableRow = memo(ExpandableRowInner) as typeof ExpandableRowInner;