import type { Option } from "@/packages/@core/data-access/db/schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "./data-table.column-header";

export const optionColumns: ColumnDef<Option>[] = [
  {
    accessorKey: "optionName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: ({ getValue }) => {
      return (
        <TypographySmall className="text-sm">
          {String(getValue() ?? "N/A")}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "optionShortName",
    header: "Nom Court",
    cell: ({ getValue }) => (
      <TypographySmall className="text-foreground text-sm">
        {String(getValue() ?? "N/A")}
      </TypographySmall>
    ),
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
];
