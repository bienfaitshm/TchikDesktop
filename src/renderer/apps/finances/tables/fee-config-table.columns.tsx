import type { FeeConfiguration } from "@/packages/@core/data-access/db";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { formatCurrency } from "@/packages/currency";

export const feeConfigColumns: ColumnDef<FeeConfiguration>[] = [
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
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant a payer" />
    ),
    cell: ({ getValue, row: { original } }) => {
      return (
        <TypographySmall className="text-sm">
          {formatCurrency(String(getValue() ?? "N/A"), original.currency)}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "section",
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
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
  },
];
