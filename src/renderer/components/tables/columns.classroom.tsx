import type { ClassroomDTO } from "@/packages/@core/data-access/db/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { SectionBadge } from "@/renderer/components/section-badge";
import { DataTableColumnHeader } from "./data-table.column-header";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";

export const classroomColumns: ColumnDef<ClassroomDTO>[] = [
  {
    accessorKey: "identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: ({ getValue }) => {
      return (
        <TypographySmall className="text-foreground max-w-20">
          {getValue<string>()}
        </TypographySmall>
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
    accessorKey: "optionId",
    header: "Option",
    enableHiding: true,
    cell: ({ row }) => (
      <TypographySmall className="text-muted-foreground">
        {row.original?.option?.optionName}
      </TypographySmall>
    ),
  },
];
