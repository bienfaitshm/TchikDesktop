import type { TClassroom } from "@/commons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { SectionBadge } from "@/renderer/components/section-badge"
import { Checkbox } from "@/renderer/components/ui/checkbox"


export const ClassroomColumns: ColumnDef<TClassroom>[] = [
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
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {

        accessorKey: "classId",
        header: "ID",
        cell: ({ row }) => {

            return (
                <TypographySmall className="font-mono text-muted-foreground">
                    {row.original.classId.substring(0, 8)}...
                </TypographySmall>
            );
        },
        enableSorting: true,
        enableHiding: false,
        enableColumnFilter: false,
    },
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
        cell: ({ row }) => (
            <SectionBadge section={row.original.section} />
        ),
        enableSorting: true,
        enableHiding: true,
        enableColumnFilter: true,
    },
]