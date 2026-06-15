import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import React from "react";
import { Badge } from "@/renderer/components/ui/badge";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { CheckCircle, MinusCircle } from "lucide-react";
import type { TSchool } from "@/packages/@core/data-access/db/schemas/types";
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

export const SchoolColumns: ColumnDef<TSchool>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => {
      return <TypographySmall>{row.original.name}</TypographySmall>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "ville",
    header: "Ville",
    cell: ({ row }) => <TypographySmall>{row.original.town}</TypographySmall>,
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ row }) => (
      <TypographySmall>{row.original.address}</TypographySmall>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <SchoolStatusBadge schoolId={row.original.schoolId} />,
  },
];
