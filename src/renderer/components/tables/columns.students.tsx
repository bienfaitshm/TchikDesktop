import { GenderBadge } from "@/renderer/components/user-gender";
import { StudentStatusBadge } from "@/renderer/components/student-status";
import { DataTableColumnHeader } from "./data-table.column-header";
import type { EnrollmentDTO } from "@/packages/@core/data-access/db/queries";
import { formatDate } from "@/packages/times";
import type { TableColumnDef } from "./hooks";
import { StudentCellIdentity } from "../student-cell-indentity";

/**
 * Column definitions configuration array for rendering student enrollment tables.
 */
export const studentColumns: TableColumnDef<EnrollmentDTO>[] = [
  {
    accessorKey: "student.fullName",
    enableSorting: true,
    enableColumnFilter: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom, postnom et prénom" />
    ),
    cell: ({ row: { original: enrollment } }) => (
      <StudentCellIdentity
        fullName={enrollment.student.fullName}
        gender={enrollment.student.gender}
        isNewStudent={enrollment.isNewStudent}
        isProDeo={enrollment.isProDeo}
      />
    ),
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
    header: "Code d'inscription",
    cell: ({ row }) => (
      <p data-slot="table-code" className="text-xs">
        {row.original.studentCode ?? "—"}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-center"
        column={column}
        title="Date d'inscription"
      />
    ),
    cell: ({ row }) => (
      <p data-slot="table-code" className="text-xs">
        {formatDate(row.original.createdAt, "dd/MM/yyyy - HH:mm") ?? "—"}
      </p>
    ),
  },
];
