import React from "react";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import { DropdownMenuSeparator } from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import { cn } from "@/renderer/utils";

export type ActionMenuConfig<TProps> = {
  id: string;
  label: string;
  dialog(props: TProps): React.ReactElement;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  separator?: boolean;
  variant?: "destructive";
};

/**
 * Creates a React component rendering an action dropdown menu linked to modal dialogs.
 * @param menus - Array of action menu configurations.
 * @returns A functional component accepting props passed down to dialog renders.
 */
export function createActionMenus<
  ActionProps extends Record<string, unknown> = Record<string, unknown>,
>(menus: ActionMenuConfig<ActionProps>[]): React.FC<ActionProps> {
  const ActionMenuComponent: React.FC<ActionProps> = (props) => {
    return (
      <ActionMenu
        trigger={<ButtonMenu />}
        dialogs={menus.map((menu) => (
          <MenuDialogWrapper key={menu.id} id={menu.id}>
            {menu.dialog(props)}
          </MenuDialogWrapper>
        ))}
      >
        {menus.map((menu) => (
          <React.Fragment key={menu.id}>
            {menu.separator && <DropdownMenuSeparator />}
            <MenuDialogItem
              targetId={menu.id}
              className={cn(
                "gap-2 cursor-pointer",
                menu.variant === "destructive" &&
                  "text-destructive focus:text-destructive focus:bg-destructive/10",
              )}
            >
              {menu.icon && (
                <menu.icon className={cn("size-4", menu.iconClassName)} />
              )}
              <span>{menu.label}</span>
            </MenuDialogItem>
          </React.Fragment>
        ))}
      </ActionMenu>
    );
  };

  ActionMenuComponent.displayName = "CreatedActionMenu";

  return ActionMenuComponent;
}
