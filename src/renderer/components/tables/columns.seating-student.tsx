import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";

export type StudentSeating = {
  fullName: string;
  identifier: string;
  classroomId: string;
  row: number;
  column: number;
};

export const SeatingStudentColumns: ColumnDef<StudentSeating>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: ({ row }) => (
      <TypographySmall className="font-medium text-foreground">
        {row.getValue("fullName")}
      </TypographySmall>
    ),
  },
  {
    accessorKey: "identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salle de classe" />
    ),
    cell: ({ row }) => (
      <TypographySmall className="text-muted-foreground">
        {row.getValue("identifier")}
      </TypographySmall>
    ),
  },

  {
    id: "seat",
    header: "Siège (Lig/Col)",
    cell: ({ row }) => {
      const r = row.original.row;
      const c = row.original.column;
      return (
        <div
          className="flex items-center gap-2 text-xs font-medium text-foreground"
          aria-label={`Rangée ${r}, Colonne ${c}`}
        >
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
            R{r}
          </span>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
            C{c}
          </span>
        </div>
      );
    },
  },
];
