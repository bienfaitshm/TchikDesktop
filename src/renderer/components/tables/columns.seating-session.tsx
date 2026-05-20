import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/renderer/components/ui/badge"; // Plus adapté pour le statut
import { DataTableColumnHeader } from "./data-table.column-header";
import type { TSeatingSession } from "@/packages/@core/data-access/db/schemas/types";

/**
 * On définit un type étendu propre pour la table.
 * Évite les intersections "&" à la volée dans la définition des colonnes.
 */
export type SeatingSessionTableData = TSeatingSession & {
  hasAssignments?: boolean;
};

export const seatingSessionColumns: ColumnDef<SeatingSessionTableData>[] = [
  {
    accessorKey: "sessionName",
    // Utiliser le header personnalisé pour le tri
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Session" />
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate font-semibold">
        {row.getValue("sessionName")}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "hasAssignments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const isAssigned = !!row.getValue("hasAssignments");

      return (
        <Badge
          variant={isAssigned ? "success" : "outline"}
          className={!isAssigned ? "text-muted-foreground italic" : ""}
        >
          {isAssigned ? "Assignée" : "À pourvoir"}
        </Badge>
      );
    },
    // On peut filtrer sur ce statut
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
];
