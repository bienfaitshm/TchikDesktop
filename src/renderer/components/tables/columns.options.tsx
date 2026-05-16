import type { TOptionAttributes as TOption } from "@/packages/@core/data-access/schema-validations";
import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";

export const optionColumns: ColumnDef<TOption>[] = [
  {
    accessorKey: "optionName",
    header: "Nom Complet",
    cell: ({ row }) => {
      return (
        <TypographySmall className="font-medium text-foreground">
          {row.original.optionName}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "optionShortName",
    header: "Nom Court",
    cell: ({ row }) => (
      <TypographySmall className="text-muted-foreground">
        {row.original.optionShortName}
      </TypographySmall>
    ),
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
];
