import type { FeeConfigurationDTO } from "@/packages/@core/data-access/db";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { formatCurrency } from "@/packages/currency";
import { Badge } from "@/renderer/components/ui/badge";
import { School, Layers, GraduationCap } from "lucide-react";

export const feeConfigColumns: ColumnDef<FeeConfigurationDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Libellé du Frais" />
    ),
    cell: ({ getValue }) => {
      const name = getValue() as string;
      return (
        <p className="font-medium  text-sm text-foreground max-w-70 truncate">
          {name ?? "Sans nom"}
        </p>
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
      // Cas 1 : Application à une classe spécifique (Le plus précis)
      if (original.classroom) {
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] font-medium px-2 py-0.5 rounded-md"
            >
              <GraduationCap className="w-3 h-3 mr-1 shrink-0" />
              Classe : {original.classroom.identifier}
            </Badge>
          </div>
        );
      }

      // Cas 2 : Application à toute une option
      if (original.option) {
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[11px] font-medium px-2 py-0.5 rounded-md"
            >
              <Layers className="w-3 h-3 mr-1 shrink-0" />
              Option : {original.option.optionName}
            </Badge>
          </div>
        );
      }

      // Cas 3 : Application à toute une section
      if (original.section) {
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium px-2 py-0.5 rounded-md"
            >
              <School className="w-3 h-3 mr-1 shrink-0" />
              Section : {original.section}
            </Badge>
          </div>
        );
      }

      // Fallback au cas où rien n'est configuré
      return (
        <span className="text-xs text-muted-foreground italic">
          Non spécifié
        </span>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
];
