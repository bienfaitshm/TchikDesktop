import type { ColumnDef } from "@tanstack/react-table"
import { TypographySmall } from "@/renderer/components/ui/typography"
import type { TSeatingSession } from "@/packages/@core/data-access/db/schemas/types";
import { DataTableColumnHeader } from "./data-table.column-header";


export const SeatingSessionColumns: ColumnDef<TSeatingSession>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
        cell: ({ row }) => {
            return <TypographySmall>{row.original.sessionName}</TypographySmall>
        },
        enableHiding: false,
    },
]