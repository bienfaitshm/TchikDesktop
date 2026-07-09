import type { ColumnDef, Row } from "@tanstack/react-table";
import { ExpandableTrigger } from "@/renderer/components/tables/data-table.expandable";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import React from "react";

const createSelectColumn = <T,>(): ColumnDef<T> => ({
  id: "select",
  header: ({ table }) => (
    <div className="flex items-center justify-center">
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
    <div className="flex items-center justify-center">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
});

type EnhanceColumnsOptions<T> = {
  enableSelection?: boolean;
  variant?: "actions" | "expandable" | "none";
  renderRowAction?: (item: T, row: Row<T>) => React.ReactNode;
};

/**
 * Rehausse un tableau de colonnes TanStack avec des fonctionnalités standardisées (Sélection, Actions, Expansion).
 */
export function enhanceColumns<T>(
  columns: ColumnDef<T>[],
  options: EnhanceColumnsOptions<T> = {},
): ColumnDef<T>[] {
  const { enableSelection = true, variant = "none", renderRowAction } = options;

  const enhanced: ColumnDef<T>[] = [];

  if (enableSelection) {
    enhanced.push(createSelectColumn<T>());
  }

  enhanced.push(...columns);

  if (variant === "expandable") {
    enhanced.push({
      id: "actions",
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
    });
  } else if (variant === "actions" && renderRowAction) {
    enhanced.push({
      id: "actions",
      cell: ({ row }) => <>{renderRowAction(row.original, row)}</>,
    });
  }

  return enhanced;
}

export function enhanceColumnsExpandable<T>(columns: ColumnDef<T>[]) {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
    {
      id: "actions",
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
    },
  ];
}
