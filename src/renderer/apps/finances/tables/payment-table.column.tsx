import type * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  AssignmentTableOfClassroom,
  User,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { createSelectColumn } from "@/renderer/components/tables/columns.utils";

/**
 * Formats a student entity into a single full name string.
 * @param student - User record containing student name attributes.
 * @returns Formatted full name string or fallback label.
 */
const formatStudentName = (student: User): string => {
  return (
    [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ") || "Élève sans nom"
  );
};

/**
 * Static column definitions for payment assignment tables.
 */
export const staticPaymentColumns: ColumnDef<AssignmentTableOfClassroom>[] = [
  createSelectColumn(),
  {
    accessorKey: "student",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="max-w-64"
        column={column}
        title="Élève"
      />
    ),
    accessorFn: (row) => formatStudentName(row.student),
    cell: ({ row }) => {
      const studentName = formatStudentName(row.original.student);
      return (
        <div className="flex items-center min-h-9 px-2">
          <span
            className="font-medium text-xs text-foreground truncate max-w-64 uppercase"
            title={studentName}
          >
            {studentName}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
];

/**
 * Generates table column definitions including dynamic fee schedule columns.
 * @param heads - List of payment schedule headers containing identifiers and display names.
 * @param renderCell - Custom render callback function for active fee assignments.
 * @returns Array of table column definitions.
 */
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
          className="justify-end text-right min-w-28"
        />
      ),
      cell: ({ row }) => {
        const feeAssignment: FeeAssignment | null =
          row.original.payments[head.id] ?? null;

        if (!feeAssignment) {
          return (
            <div className="flex items-center justify-end min-h-9 px-2">
              <span className="text-muted-foreground/40 font-mono text-xs select-none">
                —
              </span>
            </div>
          );
        }

        return renderCell(feeAssignment);
      },
      enableSorting: false,
    }),
  );

  return [...staticPaymentColumns, ...dynamicColumns];
};
