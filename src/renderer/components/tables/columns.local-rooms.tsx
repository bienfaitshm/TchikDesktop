import type { ColumnDef } from "@tanstack/react-table";
import { TypographySmall } from "@/renderer/components/ui/typography";
import { Badge } from "@/renderer/components/ui/badge";
import { LayoutGrid, Users } from "lucide-react";
import type { Localroom } from "@/packages/@core/data-access/db/schemas";
import { DataTableColumnHeader } from "./data-table.column-header";

export const localRoomColumns: ColumnDef<Localroom>[] = [
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
    accessorKey: "maxCapacity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacité Max" />
    ),
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <Users className="size-3.5 text-muted-foreground" />
        <TypographySmall className="text-muted-foreground">
          {getValue<string>()} places
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
