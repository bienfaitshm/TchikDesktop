import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { GenderBadge } from "@/renderer/components/user-gender";
import { Badge } from "@/renderer/components/ui/badge"; // Hypothèse d'usage de Shadcn
import type { USER_GENDER_ENUM } from "@/packages/@core/data-access/db";

export type StudentSeating = {
  fullName: string;
  identifier: string;
  classroomId: string;
  gender?: USER_GENDER_ENUM;
  row: number;
  column: number;
};

export const seatingStudentColumns: ColumnDef<StudentSeating>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Étudiant" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-foreground tracking-tight">
          {row.original.fullName}
        </span>
        {/* On peut ajouter un sous-texte ici si besoin, ex: ID étudiant */}
      </div>
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Genre" />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      return gender ? (
        <GenderBadge withIcon gender={gender} />
      ) : (
        <span className="text-muted-foreground/50">-</span>
      );
    },
  },
  {
    accessorKey: "identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Classe" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal capitalize">
        {row.original.identifier}
      </Badge>
    ),
  },
  {
    id: "seat",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emplacement" />
    ),
    accessorFn: (row) => `${row.row}-${row.column}`,
    cell: ({ row }) => {
      const { row: r, column: c } = row.original;
      return (
        <div
          className="inline-flex items-center gap-1.5 border rounded-md px-2 py-1 bg-muted/30"
          title={`Rangée ${r}, Colonne ${c}`}
        >
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">
              Ranger
            </span>
            <span className="text-sm font-mono font-medium">{r}</span>
          </div>
          <div className="w-[1px] h-3 bg-border" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-muted-foreground font-bold">
              Banc
            </span>
            <span className="text-sm font-mono font-medium">{c}</span>
          </div>
        </div>
      );
    },
  },
];
