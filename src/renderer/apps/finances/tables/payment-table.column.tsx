import type * as React from "react";
import type {
  AssignmentTableOfClassroom,
  User,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";
import { StudentCellIdentity } from "@/renderer/components/student-cell-indentity";
import type { TableColumnDef } from "@/renderer/components/tables/hooks";
/**
 * Formate les informations de l'élève en une chaîne unique.
 */
const formatStudentName = (student: User): string => {
  return (
    [student.lastName, student.middleName, student.firstName]
      .filter(Boolean)
      .join(" ") || "Élève sans nom"
  );
};

/**
 * Colonnes statiques de base pour le tableau des paiements.
 */
export const staticPaymentColumns: TableColumnDef<AssignmentTableOfClassroom>[] =
  [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="max-w-16"
          column={column}
          title="Élève"
        />
      ),
      accessorFn: (row) => formatStudentName(row.student),
      cell: ({ row: { original: enrollment } }) => {
        return (
          <StudentCellIdentity
            fullName={formatStudentName(enrollment.student)}
            gender={enrollment.student.gender}
            isNewStudent={enrollment.isNewStudent}
            isProDeo={enrollment.isProDeo}
          />
        );
      },
      enableSorting: true,
    },
  ];

/**
 * Génère l'ensemble des colonnes du tableau en y ajoutant les échéances dynamiques.
 */
export const createPaymentColumns = (
  heads: { id: string; name: string }[],
  renderCell: (feeAssignment: FeeAssignment) => React.ReactNode,
): TableColumnDef<AssignmentTableOfClassroom>[] => {
  const dynamicColumns: TableColumnDef<AssignmentTableOfClassroom>[] =
    heads.map((head) => ({
      id: `schedule_${head.id}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={head.name}
          className="justify-end text-right min-w-16 truncate"
        />
      ),
      cell: ({ row }) => {
        const feeAssignment: FeeAssignment | null =
          row.original.payments[head.id] ?? null;

        if (!feeAssignment) {
          return (
            <div className="flex items-center justify-end min-h-8 px-2">
              <span className="text-muted-foreground/30 font-mono text-xs select-none">
                —
              </span>
            </div>
          );
        }

        return renderCell(feeAssignment);
      },
      enableSorting: false,
    }));

  return [...staticPaymentColumns, ...dynamicColumns];
};
