import type { FeeTypeDTO } from "@/packages/@core/data-access/db";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";

/**
 * Renders a standard table cell wrapped in a small typography component with fallback handling.
 * @param context - The cell context containing the cell's raw value.
 * @returns The formatted JSX element displaying the stringified value or 'N/A'.
 */
const renderDefaultCell = (context: CellContext<FeeTypeDTO, unknown>) => (
  <TypographySmall className="text-sm">
    {String(context.getValue() ?? "N/A")}
  </TypographySmall>
);

/**
 * Column definitions configuration for the FeeType data table.
 */
export const feeTypeColumns: ColumnDef<FeeTypeDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: renderDefaultCell,
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },

  {
    accessorKey: "walletId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Portefeuille" />
    ),
    cell: ({ row: { original } }) => {
      return (
        <TypographySmall className="text-sm">
          {original.wallet.name}
        </TypographySmall>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
  },
];
