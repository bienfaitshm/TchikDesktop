import type { TutorDTO } from "@/packages/@core/data-access/db";
import type { ColumnDef, Column } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/renderer/components/tables/data-table.column-header";

/**
 * Renders a standardized table column header with sorting capabilities.
 * @param column - The table column instance.
 * @param title - The localized display title for the column header.
 * @returns A React element rendering the column header.
 */
const renderColumnHeader = (
  column: Column<TutorDTO, unknown>,
  title: string,
) => (
  <DataTableColumnHeader className="max-w-44" column={column} title={title} />
);

/**
 * Renders a simple text cell with default formatting and null handling.
 * @param value - The raw text content to display, or null/undefined.
 * @returns A React element containing the formatted text.
 */
const renderTextCell = (value: string | null | undefined) => (
  <div className="text-xs text-foreground max-w-40">
    <p>{value ?? "-"}</p>
  </div>
);

/**
 * Configuration array defining columns for the Tutor data table.
 */
export const tutorColumns: ColumnDef<TutorDTO>[] = [
  {
    accessorKey: "user",
    header: ({ column }) =>
      renderColumnHeader(column, "Nom, postnom et prénom"),
    cell: ({ row: { original } }) => {
      const fullName = original?.fullName ?? "Sans nom";
      const profession = original.profession;

      return (
        <div className="max-w-sm">
          <p className="font-medium text-xs uppercase text-foreground max-w-70 truncate">
            {fullName}
          </p>
          {profession && (
            <p className="text-xs text-muted-foreground">{profession}</p>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => renderColumnHeader(column, "Numéro de Téléphone"),
    cell: ({ getValue }) => renderTextCell(getValue<string | null>()),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "address",
    header: ({ column }) => renderColumnHeader(column, "Adresse"),
    cell: ({ getValue }) => renderTextCell(getValue<string | null>()),
    enableSorting: true,
    enableHiding: false,
  },
];
