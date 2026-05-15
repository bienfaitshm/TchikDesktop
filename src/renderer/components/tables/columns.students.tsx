import type { ColumnDef } from "@tanstack/react-table";
import { GenderBadge } from "../user-gender";
import { StudentStatusBadge } from "../student-status";
import { StudentAvatar } from "../student-avatar";
import { DataTableColumnHeader } from "./data-table.column-header";

export type TEnrolement = {
  enrolementId: string;
  status: any;
  isNewStudent: boolean;
  studentCode: string;
  studentId: string;
  student: {
    gender: any;
    fullName: string;
  };
  classroom: {
    shortIdentifier: string;
  };
};

export const StudentColumns: ColumnDef<TEnrolement>[] = [
  {
    accessorKey: "student.fullName",
    enableSorting: true,
    enableColumnFilter: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom, postnom et prénom" />
    ),
    cell: ({ row }) => {
      const student = row.original.student;
      const isNew = row.original.isNewStudent;
      return (
        <div className="flex items-center gap-3">
          <StudentAvatar fullName={student.fullName} />
          <div className="flex flex-col">
            <span className="font-medium leading-none">{student.fullName}</span>
            <span className="text-[10px] uppercase mt-1 text-muted-foreground">
              {isNew ? "Nouveau" : "Ancien"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "student.gender",
    header: "Sexe",
    cell: ({
      row: {
        original: { student },
      },
    }) => <GenderBadge withIcon gender={student.gender} />,
  },
  {
    accessorKey: "studentCode",
    header: "Code",
    cell: ({ row }) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
        {row.original.studentCode}
      </code>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
  },
];
