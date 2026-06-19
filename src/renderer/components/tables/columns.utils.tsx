import { ColumnDef } from "@tanstack/react-table";
import { ExpandableTrigger } from "@/renderer/components/tables/data-table.expandable";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
          <TooltipTrigger>
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
