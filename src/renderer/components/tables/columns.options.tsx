import type { TOptionAttributes as TOption } from "@/packages/@core/data-access/schema-validations"
import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { SectionBadge } from "@/renderer/components/section-badge"
import { Checkbox } from "@/renderer/components/ui/checkbox"
import { ExpandableTrigger } from "./data-table.expandable"


export const OptionColumns: ColumnDef<TOption>[] = [
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
    {
        id: "actions",
        cell: () => <ExpandableTrigger />
    },
]