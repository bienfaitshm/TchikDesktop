import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import React from "react";
import { Badge } from "@/renderer/components/ui/badge";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { CheckCircle, MinusCircle } from "lucide-react";
import type { School } from "@/packages/@core/data-access/db/schemas";
import { DataTableColumnHeader } from "./data-table.column-header";

const SchoolStatusBadge: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const { schoolId: currentActiveSchoolId } = useCurrentConfig();
  const isActive = currentActiveSchoolId === schoolId;

  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className="flex items-center gap-1 w-fit"
    >
      {isActive ? (
        <CheckCircle className="size-4" />
      ) : (
        <MinusCircle className="size-4" />
      )}
      <span>{isActive ? "Active" : "Inactive"}</span>
    </Badge>
  );
};

export const schoolColumns: ColumnDef<School>[] = [
  {
    accessorKey: "name",
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
    accessorKey: "town",
    header: "Ville",
    cell: ({ getValue }) => (
      <TypographySmall className="text-muted-foreground">
        {getValue<string>()}
      </TypographySmall>
    ),
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ getValue }) => (
      <TypographySmall className="text-muted-foreground">
        {getValue<string>()}
      </TypographySmall>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <SchoolStatusBadge schoolId={row.original.schoolId} />,
  },
];
