import type { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import React from "react";

export type DataTableMenu = {
    separator?: boolean;
    label: string;
    key: string;
};

export type EnhanceColumnsWithMenuParams<T> = {
    columns: ColumnDef<T>[];
    menus?: DataTableMenu[];
    onPressMenu?: (key: string, value?: T) => void;
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
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                        >
                            <EllipsisVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        {menus.map((menu, index) =>
                            <React.Fragment key={`${menu.key}-${index}`}>
                                {menu.separator && <DropdownMenuSeparator key={`separator-${menu.key}`} />
                                }
                                <DropdownMenuItem
                                    onClick={() => onPressMenu?.(menu.key, row.original)}
                                >
                                    {menu.label}
                                </DropdownMenuItem>
                            </React.Fragment>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        } as ColumnDef<T>,
    ];
}