import type { SchoolAttributes } from "@/camons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"


export const SchoolColumns: ColumnDef<SchoolAttributes>[] = [
    {
        accessorKey: "schoolId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.schoolId}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.name}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "ville",
        header: "Ville",
        cell: ({ row }) => <TypographySmall>{row.original.town}</TypographySmall>
    },
    {
        accessorKey: "adress",
        header: "Adresse",
        cell: ({ row }) => <TypographySmall>{row.original.adress}</TypographySmall>,
    },
]