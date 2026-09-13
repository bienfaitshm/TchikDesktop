import type * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  AssignmentTableOfClassroom,
  User,
  FeeAssignment,
} from "@/packages/@core/data-access/db";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";

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
export const staticPaymentColumns: ColumnDef<AssignmentTableOfClassroom>[] = [
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
      const isProDeo = row.original.isProDeo;

      return (
        <div className="flex items-center gap-2 py-1 px-1 min-h-8">
          <span
            className="font-semibold text-xs text-foreground truncate max-w-56 uppercase tracking-tight"
            title={studentName}
          >
            {studentName}
          </span>

          {isProDeo && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              Pro Deo
            </span>
          )}
        </div>
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
    }),
  );

  return [...staticPaymentColumns, ...dynamicColumns];
};
