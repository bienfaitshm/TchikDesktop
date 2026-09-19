"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  Pin,
  PinOff,
} from "lucide-react";
import type { Column, RowData } from "@tanstack/react-table";
import { cn } from "@/renderer/utils";
import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { TableFeature } from "./hooks";
/**
 * Props for the DataTableColumnHeader component.
 */
export interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  /** The TanStack Table column instance. */
  column: Column<TableFeature, TData, TValue>;
  /** The localized display title for the column header. */
  title: string;
}

/**
 * Renders an interactive table column header supporting sorting, column pinning, and visibility toggling.
 * @param props - Component properties including column reference, title, and optional styling class.
 * @returns The rendered column header element with contextual dropdown control.
 */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort();
  const canPin = column.getCanPin();
  const canHide = column.getCanHide();

  if (!canSort && !canPin && !canHide) {
    return <div className={cn("text-xs", className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();
  const isPinned = column.getIsPinned();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 flex items-center justify-between data-[state=open]:bg-accent text-xs hover:text-foreground",
              isSorted && "text-foreground font-semibold",
              isPinned && "bg-accent/40",
              className,
            )}
          >
            <div className="flex items-center gap-1.5">
              {isPinned && (
                <Pin className="size-3 text-muted-foreground rotate-45" />
              )}
              <span>{title}</span>
            </div>
            {isSorted === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : isSorted === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ChevronsUpDown className="ml-2 size-3.5 opacity-50" />
            )}
          </Button>
        }
      ></DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48 text-xs">
        {canSort && (
          <>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
              className={cn(isSorted === "asc" && "bg-accent/50")}
            >
              <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
              Croissant
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
              className={cn(isSorted === "desc" && "bg-accent/50")}
            >
              <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
              Décroissant
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <ChevronsUpDown className="mr-2 size-3.5 text-muted-foreground/70" />
              Réinitialiser
            </DropdownMenuItem>
          </>
        )}

        {canPin && (
          <>
            {canSort && <DropdownMenuSeparator />}
            {isPinned !== "start" && (
              <DropdownMenuItem onClick={() => column.pin("start")}>
                <Pin className="mr-2 size-3.5 text-muted-foreground/70" />
                Épingler à gauche
              </DropdownMenuItem>
            )}
            {isPinned !== "end" && (
              <DropdownMenuItem onClick={() => column.pin("end")}>
                <Pin className="mr-2 size-3.5 text-muted-foreground/70" />
                Épingler à droite
              </DropdownMenuItem>
            )}
            {isPinned && (
              <DropdownMenuItem onClick={() => column.pin(false)}>
                <PinOff className="mr-2 size-3.5 text-muted-foreground/70" />
                Désépingler
              </DropdownMenuItem>
            )}
          </>
        )}

        {canHide && (
          <>
            {(canSort || canPin) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
              Masquer la colonne
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
