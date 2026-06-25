import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/renderer/components/ui/badge";
import type { TSeatingSession } from "@/packages/@core/data-access/db/schemas/types";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "./data-table.column-header";
import { Link } from "react-router";
import { APP_ROUTES } from "@/renderer/constants";

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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: ({ getValue, row: { original: session } }) => {
      return (
        <Link
          to={APP_ROUTES.SEATING.SESSION(session.sessionId)}
          className="hover:underline"
        >
          <TypographySmall className="text-foreground max-w-20">
            {getValue<string>()}
          </TypographySmall>
        </Link>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "hasAssignments",
    header: "Statut",
    cell: ({ row }) => {
      const isAssigned = !!row.getValue("hasAssignments");

      return (
        <Badge
          variant={isAssigned ? "default" : "outline"}
          className={!isAssigned ? "text-muted-foreground italic" : ""}
        >
          {isAssigned ? "Assignée" : "À pourvoir"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
];
