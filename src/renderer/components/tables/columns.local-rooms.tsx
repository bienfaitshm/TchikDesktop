import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { Badge } from "@/renderer/components/ui/badge";
import { LayoutGrid, Users } from "lucide-react";
import type { Localroom } from "@/packages/@core/data-access/db/schemas";

export const localRoomColumns: ColumnDef<Localroom>[] = [
  {
    accessorKey: "name",
    header: "Nom du local",
    cell: ({ row }) => {
      return (
        <TypographySmall className="font-medium text-foreground">
          {row.original.name}
        </TypographySmall>
      );
    },
    enableSorting: true,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "maxCapacity",
    header: "Capacité Max",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="size-3.5 text-muted-foreground" />
        <TypographySmall className="text-muted-foreground">
          {row.original.maxCapacity} places
        </TypographySmall>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "dimensions",
    header: "Dimensions (R x C)",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <LayoutGrid className="size-3.5 text-muted-foreground" />
        <Badge variant="outline" className="font-mono text-[10px]">
          {row.original.totalRows} x {row.original.totalColumns}
        </Badge>
      </div>
    ),
  },
];
