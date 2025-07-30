import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { Button } from "@/renderer/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import React from "react";


export type DataTableMenu = {
  separator?: boolean;
  label: string;
  key: string;
  icon?: React.ReactNode
};

type ButtonMenuProps<T> = {
  menus?: DataTableMenu[];
  onPressMenu?: (key: string, value?: T) => void;
  value?: T
}
export const ButtonMenu: React.FC<ButtonMenuProps<any>> = ({ menus = [], value, onPressMenu }) => {
  return (
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
              className="gap-4"
              onClick={() => onPressMenu?.(menu.key, value)}
            >
              {menu?.icon}
              {menu.label}
            </DropdownMenuItem>
          </React.Fragment>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}