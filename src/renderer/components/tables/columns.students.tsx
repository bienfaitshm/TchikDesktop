import type { ColumnDef, Row } from "@tanstack/react-table";
import { GenderBadge } from "@/renderer/components/user-gender";
import { StudentStatusBadge } from "@/renderer/components/student-status";
import { StudentAvatar } from "@/renderer/components/student-avatar";
import { DataTableColumnHeader } from "./data-table.column-header";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/renderer/components/ui/item";
import type { EnrollmentDTO } from "@/packages/@core/data-access/db/queries";

/**
 * Renders the student identity cell containing avatar, name, and status type label.
 * @param props - Component props containing the row context.
 * @returns The rendered React item layout.
 */
function StudentIdentityCell({ row }: { row: Row<EnrollmentDTO> }) {
  const student = row.original.student;
  const isNewStudent = row.original.isNewStudent;
  const fullName = student?.fullName ?? "—";

  return (
    <Item className="bg-transparent border-none p-0 gap-3 min-w-37.5">
      <ItemMedia>
        <StudentAvatar fullName={fullName} />
      </ItemMedia>
      <ItemContent className="gap-0.5">
        <ItemTitle className="text-xs font-medium leading-none text-foreground">
          {fullName}
        </ItemTitle>
        <ItemDescription className="text-[10px] font-semibold tracking-wider">
          <span
            className={
              isNewStudent ? "text-primary font-bold" : "text-muted-foreground"
            }
          >
            {isNewStudent ? "Nouveau" : "Ancien"}
          </span>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}

/**
 * Column definitions configuration array for rendering student enrollment tables.
 */
export const studentColumns: ColumnDef<EnrollmentDTO>[] = [
  {
    accessorKey: "student.fullName",
    enableSorting: true,
    enableColumnFilter: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom, postnom et prénom" />
    ),
    cell: ({ row }) => <StudentIdentityCell row={row} />,
  },
  {
    accessorKey: "student.gender",
    header: "Sexe",
    cell: ({ row }) => (
      <GenderBadge withIcon gender={row.original.student?.gender} />
    ),
  },
  {
    accessorKey: "studentCode",
    header: "Code d'inscription de l'élève",
    cell: ({ row }) => (
      <p data-slot="table-code" className="text-xs text-center">
        {row.original.studentCode ?? "—"}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
  },
];
