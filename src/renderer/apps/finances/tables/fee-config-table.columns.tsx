import type { FeeConfigurationDTO } from "@/packages/@core/data-access/db";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { formatCurrency } from "@/packages/currency";
import { getSectionLabel } from "@/packages/@core/data-access/db/options";

export const feeConfigColumns: ColumnDef<FeeConfigurationDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Libellé du Frais" />
    ),
    cell: ({ getValue, row: { original } }) => {
      const name = getValue() as string;
      return (
        <div>
          <p className="font-medium  text-sm text-foreground max-w-70 truncate">
            {name ?? "Sans nom"}
          </p>
          <p className="text-xs text-muted-foreground">
            {original.feeType.name}
          </p>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant Obligatoire" />
    ),
    cell: ({ getValue, row: { original } }) => {
      const amount = Number(getValue() ?? 0);
      return (
        <div className="text-sm text-foreground">
          {formatCurrency(amount, original.currency)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "target",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Périmètre d'Application" />
    ),
    cell: ({ row: { original } }) => {
      const feeTypeName = original.feeType.name;

      if (original.classroom) {
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>
              Ce <strong className="text-foreground">{feeTypeName}</strong> est
              appliqué à la classe de{" "}
              <strong className="text-foreground">
                {original.classroom.identifier}
              </strong>
            </span>
          </div>
        );
      }

      if (original.option) {
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>
              Ce <strong className="text-foreground">{feeTypeName}</strong> est
              appliqué à toute l'option{" "}
              <strong className="text-foreground">
                {original.option.optionName}
              </strong>
            </span>
          </div>
        );
      }

      if (original.section) {
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>
              Ce <strong className="text-foreground">{feeTypeName}</strong> est
              appliqué à toute la section{" "}
              <strong className="text-foreground">
                {getSectionLabel(original.section)}
              </strong>
            </span>
          </div>
        );
      }

      return (
        <span className="text-sm text-muted-foreground italic">
          Non spécifié
        </span>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
];
