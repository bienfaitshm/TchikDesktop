import type { TClassroomAttributes as TClassroom } from "@/packages/@core/data-access/schema-validations";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { SectionBadge } from "@/renderer/components/section-badge";

export const classroomColumns: ColumnDef<
  TClassroom & { optionName?: string }
>[] = [
  {
    accessorKey: "identifier",
    header: "Nom complet",
    cell: ({ row }) => {
      return (
        <TypographySmall className="font-medium text-foreground">
          {row.original.identifier}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "shortIdentifier",
    header: "Nom court",
    cell: ({ row }) => (
      <TypographySmall className="text-muted-foreground">
        {row.original.shortIdentifier}
      </TypographySmall>
    ),
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "section",
    header: "Section",
    cell: ({ row }) => <SectionBadge section={row.original.section} />,
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
        {row.original?.optionName}
      </TypographySmall>
    ),
  },
];
