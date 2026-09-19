import { ExpandableTrigger } from "@/renderer/components/tables/data-table.expandable";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import React from "react";
import { TableColumnDef, TableData, TableRow } from "./hooks";
/**
 * Creates a standard row selection column with a select-all header.
 */
export const createSelectColumn = <
  T extends TableData,
>(): TableColumnDef<T> => ({
  id: "select",
  size: 40,
  minSize: 40,
  maxSize: 40,
  header: ({ table }) => (
    <div
      className="flex items-center justify-center px-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    </div>
  ),
  cell: ({ row }) => (
    <div
      className="flex items-center justify-center px-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
  enableResizing: false,
});

/**
 * Creates an expandable row trigger column.
 */
export const createExpandableColumn = <
  T extends TableData,
>(): TableColumnDef<T> => ({
  id: "expandable",
  size: 48,
  minSize: 48,
  maxSize: 48,
  cell: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <ExpandableTrigger />
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        Voir les actions
      </TooltipContent>
    </Tooltip>
  ),
  enableSorting: false,
  enableHiding: false,
  enableResizing: false,
});

/**
 * Creates a custom row actions column.
 */
export const createActionsColumn = <T extends TableData>(
  renderRowAction: (item: T, row: TableRow<T>) => React.ReactNode,
): TableColumnDef<T> => ({
  id: "actions",
  cell: ({ row }) => <>{renderRowAction(row.original, row)}</>,
  enableSorting: false,
  enableHiding: false,
  enableResizing: false,
});

type EnhanceColumnsOptions<T extends TableData> = {
  enableSelection?: boolean;
  variant?: "actions" | "expandable" | "none";
  renderRowAction?: (item: T, row: TableRow<T>) => React.ReactNode;
};

/**
 * Rehausse un tableau de colonnes TanStack avec des fonctionnalités standardisées (Sélection, Actions, Expansion).
 */
export function enhanceColumns<T extends TableData>(
  columns: TableColumnDef<T>[],
  options: EnhanceColumnsOptions<T> = {},
): TableColumnDef<T>[] {
  const { enableSelection = true, variant = "none", renderRowAction } = options;

  const enhanced: TableColumnDef<T>[] = [];

  if (enableSelection) {
    enhanced.push(createSelectColumn<T>());
  }

  enhanced.push(...columns);

  if (variant === "expandable") {
    enhanced.push(createExpandableColumn<T>());
  } else if (variant === "actions" && renderRowAction) {
    enhanced.push(createActionsColumn<T>(renderRowAction));
  }

  return enhanced;
}

/**
 * Standard shortcut helper to enhance columns with selection and expansion capabilities.
 */
export function enhanceColumnsExpandable<T extends TableData>(
  columns: TableColumnDef<T>[],
): TableColumnDef<T>[] {
  return enhanceColumns(columns, {
    enableSelection: true,
    variant: "expandable",
  });
}
