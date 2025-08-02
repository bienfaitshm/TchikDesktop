import type { ClassAttributes } from "@/camons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { Badge } from "@/renderer/components/ui/badge"
import { SECTION_TRANSLATIONS } from "@/camons/constants/enum"


export const ClassroomColumns: ColumnDef<ClassAttributes>[] = [
    {
        accessorKey: "yearId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.classId}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "yearName",
        header: "Nom de l'année scolaire",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.identifier}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "startDate",
        header: "Date de début",
        cell: ({ row }) => <TypographySmall>{row.original.shortIdentifier}</TypographySmall>
    },
    {
        accessorKey: "endDate",
        header: "Date de fin",
        cell: ({ row }) => (
            <div className="w-32">
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {SECTION_TRANSLATIONS[row.original.section]}
                </Badge>
            </div>
        ),
    },
]