import type { ClassroomEnrolementAttributes } from "@/camons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { Badge } from "@/renderer/components/ui/badge"
import { SECTION_TRANSLATIONS } from "@/camons/constants/enum"


export const StudentColumns: ColumnDef<ClassroomEnrolementAttributes>[] = [
    {
        accessorKey: "optionId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.enrolementId}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "optionName",
        header: "Nom Complet",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.code}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "optionShortName",
        header: "Encientee",
        cell: ({ row }) => <TypographySmall>{row.original.isNewStudent}</TypographySmall>
    },
    {
        accessorKey: "section",
        header: "Status",
        cell: ({ row }) => (
            <div>
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {SECTION_TRANSLATIONS[row.original.status]}
                </Badge>
            </div>
        ),
    },
]