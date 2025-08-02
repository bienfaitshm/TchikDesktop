import type { StudyYearAttributes } from "@/camons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { format } from "date-fns"


export const StudyYearColumns: ColumnDef<StudyYearAttributes>[] = [
    {
        accessorKey: "yearId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.yearId}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "yearName",
        header: "Nom de l'année scolaire",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.yearName}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "startDate",
        header: "Date de début",
        cell: ({ row }) => <TypographySmall>{format(new Date(row.original.startDate), "PPP")}</TypographySmall>
    },
    {
        accessorKey: "endDate",
        header: "Date de fin",
        cell: ({ row }) => (
            <TypographySmall>{format(new Date(row.original.endDate), "PPP")}</TypographySmall>
        ),
    },
]