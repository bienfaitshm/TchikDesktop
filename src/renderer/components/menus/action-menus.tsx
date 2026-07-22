import React, { JSXElementConstructor, ReactElement, useMemo } from "react";
import { Link } from "react-router";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import {
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import { cn } from "@/renderer/utils";
import type { ComponentRenderFn, HTMLProps } from "@base-ui/react/types";
import type { MenuTriggerState } from "@base-ui/react";

export type ActionMenuConfig<TProps> = {
  id: string;
  label: string;
  dialog?(props: TProps): React.ReactElement;
  link?(props: TProps): string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  separator?: boolean;
  variant?: "destructive";
  disabled?: boolean | ((props: TProps) => boolean);
};

/**
 * Creates a reusable action menu component supporting dialogs, links, and standard items.
 * @param menus - Array of menu configurations defining actions, icons, and triggers.
 * @returns A functional React component that accepts row contextual properties.
 */
export function createActionMenus<
  ActionProps extends object = Record<string, unknown>,
>(
  menus: ActionMenuConfig<ActionProps>[],
  trigger?:
    | ReactElement<unknown, string | JSXElementConstructor<any>>
    | ComponentRenderFn<HTMLProps, MenuTriggerState>,
): React.FC<ActionProps> {
  const dialogMenus = menus.filter(
    (
      menu,
    ): menu is ActionMenuConfig<ActionProps> & {
      dialog: NonNullable<ActionMenuConfig<ActionProps>["dialog"]>;
    } => Boolean(menu.dialog),
  );

  const ActionMenuComponent: React.FC<ActionProps> = (props) => {
    const renderedDialogs = useMemo(
      () =>
        dialogMenus.map((menu) => (
          <MenuDialogWrapper key={menu.id} id={menu.id}>
            {menu.dialog(props)}
          </MenuDialogWrapper>
        )),
      [props],
    );

    return (
      <ActionMenu trigger={trigger ?? <ButtonMenu />} dialogs={renderedDialogs}>
        {menus.map((menu) => {
          const itemClasses = cn(
            "gap-2 cursor-pointer w-full flex items-center",
            menu.variant === "destructive" &&
              "text-destructive focus:text-destructive focus:bg-destructive/10",
          );

          const iconElement = menu.icon && (
            <menu.icon className={cn("size-4 shrink-0", menu.iconClassName)} />
          );

          const href = menu.link ? menu.link(props) : undefined;
          const _disabled =
            typeof menu.disabled === "function"
              ? menu.disabled?.(props)
              : menu.disabled;

          return (
            <React.Fragment key={menu.id}>
              {menu.separator && <DropdownMenuSeparator />}

              {href ? (
                <DropdownMenuItem
                  render={
                    <Link to={href}>
                      {iconElement}
                      <span>{menu.label}</span>
                    </Link>
                  }
                  className={itemClasses}
                  disabled={_disabled}
                />
              ) : menu.dialog ? (
                <MenuDialogItem
                  targetId={menu.id}
                  className={itemClasses}
                  disabled={_disabled}
                >
                  {iconElement}
                  <span>{menu.label}</span>
                </MenuDialogItem>
              ) : (
                <DropdownMenuItem className={itemClasses} disabled={_disabled}>
                  {iconElement}
                  <span>{menu.label}</span>
                </DropdownMenuItem>
              )}
            </React.Fragment>
          );
        })}
      </ActionMenu>
    );
  };

  ActionMenuComponent.displayName = "CreatedActionMenu";

  return ActionMenuComponent;
}
