import type { TLocalRoomAttributes as TLocalRoom } from "@/packages/@core/data-access/schema-validations"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { Checkbox } from "@/renderer/components/ui/checkbox"
import { Badge } from "@/renderer/components/ui/badge"
import { LayoutGrid, Users } from "lucide-react"
import { ExpandableTrigger } from "./data-table.expandable"

export const LocalRoomColumns: ColumnDef<TLocalRoom>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Sélectionner tout"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Sélectionner la ligne"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
    {
        accessorKey: "type",
        header: "Configuration",
        cell: ({ row }) => (
            <Badge variant="default" className="capitalize text-[10px]">
                {row.original.totalRows * row.original.totalColumns === row.original.maxCapacity
                    ? "Grille Standard"
                    : "Config. Spéciale"}
            </Badge>
        ),
        enableHiding: true,
    },
    {
        id: "actions",
        cell: () => <ExpandableTrigger />
    },
]