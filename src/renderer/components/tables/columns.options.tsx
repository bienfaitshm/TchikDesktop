import type { TOption } from "@/commons/types/models"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { SectionBadge } from "@/renderer/components/section-badge"


export const OptionColumns: ColumnDef<TOption>[] = [
    {

        accessorKey: "optionId",
        header: "ID",
        cell: ({ row }) => {

            return (
                <TypographySmall className="font-mono text-muted-foreground">
                    {row.original.optionId.substring(0, 8)}...
                </TypographySmall>
            );
        },
        enableSorting: true,
        enableHiding: false,
        enableColumnFilter: false,
    },
    {

        accessorKey: "optionName",
        header: "Nom Complet",
        cell: ({ row }) => {
            return (
                <TypographySmall className="font-medium text-foreground">
                    {row.original.optionName}
                </TypographySmall>
            );
        },
        enableSorting: true,
        enableHiding: true,
        enableColumnFilter: true,
    },
    {

        accessorKey: "optionShortName",
        header: "Nom Court",
        cell: ({ row }) => (
            <TypographySmall className="text-muted-foreground">
                {row.original.optionShortName}
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