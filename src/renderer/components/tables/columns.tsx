import type { ColumnDef } from "@tanstack/react-table";
import { ButtonMenu } from "@/renderer/components/button-menus";
import type { DataTableMenu } from "@/renderer/components/button-menus";


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