import type { ClassroomDTO } from "@/packages/@core/data-access/db/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { SectionBadge } from "@/renderer/components/section-badge";
import { DataTableColumnHeader } from "./data-table.column-header";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import { getSectionLabel } from "@/packages/@core/data-access/db/options";
import { APP_ROUTES } from "@/renderer/constants";
import { Link } from "react-router";

export const classroomColumns: ColumnDef<ClassroomDTO>[] = [
  {
    accessorKey: "identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: ({ getValue, row }) => {
      const value = getValue<string>();
      const { classId } = row.original;

      return (
        <Link
          to={APP_ROUTES.CLASSROOMS.STUDENTS(classId)}
          className="hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <TypographySmall
            className="text-foreground max-w-32 lg:max-w-44 inline-block truncate"
            title={value}
          >
            {value}
          </TypographySmall>
        </Link>
      );
    },
    enableSorting: true,
    enableHiding: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "shortIdentifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom court" />
    ),
    cell: ({ getValue }) => (
      <TypographySmall className="text-muted-foreground text-xs">
        {getValue<string>()}
      </TypographySmall>
    ),
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "section",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Section" />
    ),
    cell: ({ getValue }) => <SectionBadge section={getValue<SECTION_ENUM>()} />,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "option.optionName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Option" />
    ),
    enableHiding: true,
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue, row }) => {
      const optionName = getValue<string | null>();
      const section = row.original.section;

      return (
        <TypographySmall className="text-muted-foreground text-xs max-w-32 inline-block truncate">
          {optionName ??
            `Aucune option pour la section ${
              section ? getSectionLabel(section) : "N/A"
            }`}
        </TypographySmall>
      );
    },
  },
];
