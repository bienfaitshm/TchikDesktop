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
    cell: ({
      getValue,
      row: {
        original: { classId },
      },
    }) => {
      return (
        <Link
          to={APP_ROUTES.CLASSROOMS.STUDENTS(classId)}
          className="hover:underline"
        >
          <TypographySmall className="text-foreground max-w-20">
            {getValue<string>()}
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
    header: "Nom court",
    cell: ({ getValue }) => (
      <TypographySmall className="text-muted-foreground">
        {getValue<string>()}
      </TypographySmall>
    ),
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "section",
    header: "Section",
    cell: ({ getValue }) => <SectionBadge section={getValue<SECTION_ENUM>()} />,
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "option.optionName",
    header: "Option",
    enableHiding: true,
    cell: ({ getValue, row: { getValue: getRowValue } }) => {
      const section = getRowValue<SECTION_ENUM>("section");
      return (
        <TypographySmall className="text-muted-foreground">
          {String(
            getValue() ??
              `Aucune option pour la section ${section ? getSectionLabel(section) : "N/A"}`,
          )}
        </TypographySmall>
      );
    },
  },
];
