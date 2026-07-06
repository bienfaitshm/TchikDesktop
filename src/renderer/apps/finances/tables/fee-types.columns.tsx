import type { FeeType } from "@/packages/@core/data-access/db/schemas";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";

export const feeTypeColumns: ColumnDef<FeeType>[] = [
  {
    accessorKey: "name",
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
    accessorKey: "feeTypeId",
    header: "ID Type de Frais",
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
