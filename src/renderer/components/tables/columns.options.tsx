import type { OptionAttributes } from "@/commons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { Badge } from "@/renderer/components/ui/badge"
import { SECTION_TRANSLATIONS } from "@/commons/constants/enum"


export const OptionColumns: ColumnDef<OptionAttributes>[] = [
    {
        accessorKey: "optionId",
        header: "#ID",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.optionId}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "optionName",
        header: "Nom Complet",
        cell: ({ row }) => {
            return <TypographySmall>{row.original.optionName}</TypographySmall>
        },
        enableHiding: false,
    },
    {
        accessorKey: "optionShortName",
        header: "Nom Court",
        cell: ({ row }) => <TypographySmall>{row.original.optionShortName}</TypographySmall>
    },
    {
        accessorKey: "section",
        header: "Section",
        cell: ({ row }) => (
            <div>
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                    {SECTION_TRANSLATIONS[row.original.section]}
                </Badge>
            </div>
        ),
    },
]