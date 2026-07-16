import type { ColumnDef } from "@tanstack/react-table";
import type {
  AssignmentTableOfClassroom,
  User,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";

import { createSelectColumn } from "@/renderer/components/tables/columns.utils";

const formatStudentName = (student: User): string => {
  return (
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ") || "Élève sans nom"
  );
};

export const staticPaymentColumns: ColumnDef<AssignmentTableOfClassroom>[] = [
  createSelectColumn(),
  {
    accessorKey: "student",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Élève" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-sm text-foreground block truncate max-w-60">
        {formatStudentName(row.original.student)}
      </span>
    ),
    enableSorting: true,
  },
];

export const createPaymentColumns = (
  heads: { id: string; name: string }[],
  renderCell: (feeAssignment: FeeAssignment) => React.ReactNode,
): ColumnDef<AssignmentTableOfClassroom>[] => {
  const dynamicColumns: ColumnDef<AssignmentTableOfClassroom>[] = heads.map(
    (head) => ({
      id: `schedule_${head.id}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={head.name}
          className="justify-start text-left"
        />
      ),
      cell: ({ row }) => {
        const feeAssignment: FeeAssignment | null =
          row.original.payments[head.id] ?? null;

        if (!feeAssignment) {
          return (
            <span className="text-muted-foreground/30 text-xs block text-right pr-4">
              —
            </span>
          );
        }

        return renderCell(feeAssignment);
      },
      enableSorting: false,
    }),
  );

  return [...staticPaymentColumns, ...dynamicColumns];
};
