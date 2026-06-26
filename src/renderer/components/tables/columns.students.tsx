import type { ColumnDef } from "@tanstack/react-table";
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

import type { EnrollmentTDO } from "@/packages/@core/data-access/db/queries";

export const studentColumns: ColumnDef<EnrollmentTDO>[] = [
  {
    accessorKey: "student.fullName",
    enableSorting: true,
    enableColumnFilter: true,
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom, postnom et prénom" />
    ),
    cell: ({ row }) => {
      const { student, isNewStudent } = row.original;

      return (
        <Item className="bg-transparent border-none p-0 gap-3 min-w-(200px)">
          <ItemMedia>
            <StudentAvatar fullName={student.fullName} />
          </ItemMedia>
          <ItemContent className="gap-0.5">
            <ItemTitle className="text-xs font-medium leading-none text-foreground">
              {student.fullName}
            </ItemTitle>
            <ItemDescription className="text-[10px] font-semibold uppercase tracking-wider">
              <span
                className={
                  isNewStudent
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                }
              >
                {isNewStudent ? "Nouveau" : "Ancien"}
              </span>
            </ItemDescription>
          </ItemContent>
        </Item>
      );
    },
  },
  {
    accessorKey: "student.gender",
    header: "Sexe",
    cell: ({ row }) => (
      <GenderBadge withIcon gender={row.original.student.gender} />
    ),
  },
  {
    accessorKey: "studentCode",
    header: "Code",
    cell: ({ row }) => (
      <code
        data-slot="table-code"
        className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground border border-border/40"
      >
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
