"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { type Column, RowData } from "@tanstack/react-table";
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

interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TableFeature, TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs", className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "-ml-2 h-7 data-[state=open]:bg-accent text-xs hover:text-foreground",
              isSorted && "text-foreground font-semibold",
              className,
            )}
          >
            <span>{title}</span>
            {isSorted === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : isSorted === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ChevronsUpDown className="ml-2 size-3.5 opacity-50" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-45 text-xs">
        <DropdownMenuItem
          onClick={() => column.toggleSorting(false)}
          className={cn(isSorted === "asc" && "bg-accent/50")}
        >
          <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70 text-xs" />
          Croissant
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => column.toggleSorting(true)}
          className={cn(isSorted === "desc" && "bg-accent/50")}
        >
          <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70 text-xs" />
          Décroissant
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => column.clearSorting()}>
          <ChevronsUpDown className="mr-2 size-3.5 text-muted-foreground/70 text-xs" />
          Réinitialiser
        </DropdownMenuItem>

        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 size-3.5 text-muted-foreground/70 text-xs" />
              Masquer la colonne
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
