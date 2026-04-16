import type { ColumnDef } from "@tanstack/react-table";
import { ButtonMenu } from "@/renderer/components/button-menus";
import type { DataTableMenu } from "@/renderer/components/button-menus";
import type { TClassroomAttributes as TClassroom } from "@/packages/@core/data-access/schema-validations"
import { TypographySmall } from "@/renderer/components/ui/typography"
import { SectionBadge } from "@/renderer/components/section-badge"
import { Checkbox } from "@/renderer/components/ui/checkbox"
import { ExpandableTrigger } from "./data-table.expandable"


export type EnhanceColumnsWithMenuParams<T> = {
    columns: ColumnDef<T>[];
    menus?: DataTableMenu[];
    onPressMenu?: (key: string, value: T) => void;
};

export function enhanceColumnsWithMenu<T>({
    columns,
    menus,
    onPressMenu,
}: EnhanceColumnsWithMenuParams<T>): ColumnDef<T>[] {
    if (!menus?.length) return columns;

    return [
        ...columns,
        {
            id: "actions",
            cell: ({ row }) => <ButtonMenu value={row.original} menus={menus} onPressMenu={onPressMenu} />
        } as ColumnDef<T>,
    ];
}



export function enhanceColumnsExpandable<T>(columns: ColumnDef<T>[]) {
    return [
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
        ...columns,
        {
            id: "actions",
            cell: () => <ExpandableTrigger />
        },
    ]
}



