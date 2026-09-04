import React, { useState } from "react";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
} from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import { cn } from "@/renderer/utils";
import { ComponentRenderFn, HTMLProps } from "@base-ui/react/types";

export type ActionType = "dialog" | "link" | "toggle" | "action";
export type SeparatorPosition = "before" | "after" | "both" | "none";

export type Trigger =
  React.ReactElement | ComponentRenderFn<HTMLProps, unknown>;

export interface MenuItemConfig<TProps> {
  label: string;
  icon?: React.ReactNode | React.ElementType;
  type: ActionType;
  separatorPos: SeparatorPosition;
  variant?: "default" | "destructive";
  shortcut?: string;
  isDisabled?: boolean | ((props: TProps) => boolean);
  isHidden?: boolean | ((props: TProps) => boolean);
  renderDialog?: (props: TProps, close: () => void) => React.ReactNode;
  url?: string | ((props: TProps) => string);
  onAction?: (props: TProps) => void;
  isChecked?: boolean | ((props: TProps) => boolean);
  onToggleChange?: (props: TProps, checked: boolean) => void;
}

/**
 * Fluent builder class used to construct menu item configurations.
 * @template TProps - The properties type passed down to callbacks and dynamic conditions.
 */
export class MenuItemBuilder<TProps> {
  private config: MenuItemConfig<TProps>;

  constructor(label: string, icon?: React.ReactNode | React.ElementType) {
    this.config = {
      label,
      icon,
      type: "action",
      separatorPos: "none",
      variant: "default",
    };
  }

  /**
   * Configures the item to trigger a dialog when selected.
   * @param render - Function rendering the dialog component given context props and a close handle.
   */
  public dialog(
    render: (props: TProps, close: () => void) => React.ReactNode,
  ): this {
    this.config.type = "dialog";
    this.config.renderDialog = render;
    return this;
  }

  /**
   * Configures the item as a navigation link.
   * @param url - Static URL string or dynamic resolver function.
   */
  public link(url: string | ((props: TProps) => string)): this {
    this.config.type = "link";
    this.config.url = url;
    return this;
  }

  /**
   * Configures the item as a execution action.
   * @param onClick - Callback triggered when the action is executed.
   */
  public action(onClick: (props: TProps) => void): this {
    this.config.type = "action";
    this.config.onAction = onClick;
    return this;
  }

  /**
   * Configures the item as a toggle/checkbox state.
   * @param checked - Static state or resolver function evaluating check status.
   * @param onChange - Callback triggered when toggle state changes.
   */
  public toggle(
    checked: boolean | ((props: TProps) => boolean),
    onChange: (props: TProps, checked: boolean) => void,
  ): this {
    this.config.type = "toggle";
    this.config.isChecked = checked;
    this.config.onToggleChange = onChange;
    return this;
  }

  /**
   * Sets dynamic or static disabled condition.
   * @param condition - Boolean state or resolver function evaluating disabled state.
   */
  public disabled(condition: boolean | ((props: TProps) => boolean)): this {
    this.config.isDisabled = condition;
    return this;
  }

  /**
   * Sets dynamic or static hidden condition.
   * @param condition - Boolean state or resolver function evaluating visibility.
   */
  public hidden(condition: boolean | ((props: TProps) => boolean)): this {
    this.config.isHidden = condition;
    return this;
  }

  /**
   * Defines separator placement around the menu item.
   * @param position - The relative position of the separator.
   */
  public separator(position: SeparatorPosition = "after"): this {
    this.config.separatorPos = position;
    return this;
  }

  /**
   * Marks the item with a destructive visual status.
   */
  public destructive(): this {
    this.config.variant = "destructive";
    return this;
  }

  /**
   * Attaches a visual keyboard shortcut to the item.
   * @param shortcut - The keyboard shortcut label string.
   */
  public shortcut(shortcut: string): this {
    this.config.shortcut = shortcut;
    return this;
  }

  /**
   * Finalizes building and outputs raw menu item configuration.
   * @returns Compiled MenuItemConfig object.
   */
  public build(): MenuItemConfig<TProps> {
    return this.config;
  }
}

/**
 * Evaluates value or executes dynamic evaluator against properties.
 * @param value - Static value or callback function.
 * @param props - Contextual properties.
 */
function resolveValue<TProps, TReturn>(
  value: TReturn | ((props: TProps) => TReturn) | undefined,
  props: TProps,
): TReturn | undefined {
  return typeof value === "function"
    ? (value as (props: TProps) => TReturn)(props)
    : value;
}

/**
 * Helper component rendering uniform menu item contents (icon, label, shortcut).
 */
function MenuItemContent<TProps>({
  item,
}: {
  item: MenuItemConfig<TProps>;
}): React.ReactElement {
  const IconComponent = item.icon;

  return (
    <>
      {IconComponent &&
        (typeof IconComponent === "function" ? (
          <IconComponent className="size-4 shrink-0" />
        ) : (
          IconComponent
        ))}
      <span>{item.label}</span>
      {item.shortcut && (
        <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
      )}
    </>
  );
}

interface ActionMenuProps<TProps> {
  compiledSchema: Record<string, MenuItemConfig<TProps>>;
  defaultTrigger?: Trigger;
  contextProps: TProps & { trigger?: Trigger };
}

/**
 * Renders the compiled menu items inside a dropdown structure.
 */
function ActionMenuComponent<TProps>({
  compiledSchema,
  defaultTrigger,
  contextProps,
}: ActionMenuProps<TProps>): React.ReactElement {
  const [activeDialogKey, setActiveDialogKey] = useState<string | null>(null);

  const closeDialog = () => setActiveDialogKey(null);
  const entries = Object.entries(compiledSchema);
  const activeItem = activeDialogKey ? compiledSchema[activeDialogKey] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={contextProps.trigger ?? defaultTrigger ?? <ButtonMenu />}
        />
        <DropdownMenuContent align="end">
          {entries.map(([key, item]) => {
            const isHidden = resolveValue(item.isHidden, contextProps);
            if (isHidden) return null;

            const isDisabled = resolveValue(item.isDisabled, contextProps);
            const showBeforeSeparator =
              item.separatorPos === "before" || item.separatorPos === "both";
            const showAfterSeparator =
              item.separatorPos === "after" || item.separatorPos === "both";

            const itemClasses = cn(
              "gap-2 cursor-pointer flex items-center",
              item.variant === "destructive" &&
                "text-destructive focus:text-destructive focus:bg-destructive/10",
            );

            return (
              <React.Fragment key={key}>
                {showBeforeSeparator && <DropdownMenuSeparator />}

                {item.type === "dialog" && (
                  <DropdownMenuItem
                    disabled={isDisabled}
                    className={itemClasses}
                    onSelect={() => setActiveDialogKey(key)}
                  >
                    <MenuItemContent item={item} />
                  </DropdownMenuItem>
                )}

                {item.type === "action" && (
                  <DropdownMenuItem
                    disabled={isDisabled}
                    className={itemClasses}
                    onSelect={() => item.onAction?.(contextProps)}
                  >
                    <MenuItemContent item={item} />
                  </DropdownMenuItem>
                )}

                {item.type === "link" && (
                  <DropdownMenuItem
                    disabled={isDisabled}
                    render={
                      <Link
                        to={resolveValue(item.url, contextProps) ?? "#"}
                        className={itemClasses}
                      >
                        <MenuItemContent item={item} />
                      </Link>
                    }
                  />
                )}

                {item.type === "toggle" && (
                  <DropdownMenuCheckboxItem
                    disabled={isDisabled}
                    checked={
                      resolveValue(item.isChecked, contextProps) ?? false
                    }
                    onCheckedChange={(checked) =>
                      item.onToggleChange?.(contextProps, checked)
                    }
                  >
                    <MenuItemContent item={item} />
                  </DropdownMenuCheckboxItem>
                )}

                {showAfterSeparator && <DropdownMenuSeparator />}
              </React.Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeItem?.type === "dialog" &&
        activeItem.renderDialog?.(contextProps, closeDialog)}
    </>
  );
}

/**
 * Creates a type-safe menu builder context supporting autocomplete for specified properties.
 * @template TProps - Context properties used within menu items handlers and conditions.
 * @returns Builder factory utilities to design menu components.
 */
export function createMenuBuilder<TProps>() {
  return {
    label: (label: string, icon?: React.ReactNode | React.ElementType) =>
      new MenuItemBuilder<TProps>(label, icon),

    build: (
      schema: Record<string, MenuItemBuilder<TProps>>,
      defaultOptions?: { trigger?: Trigger },
    ): React.FC<TProps & { trigger?: Trigger }> => {
      const compiledSchema: Record<string, MenuItemConfig<TProps>> = {};

      for (const key in schema) {
        if (Object.prototype.hasOwnProperty.call(schema, key)) {
          compiledSchema[key] = schema[key].build();
        }
      }

      const ActionMenu: React.FC<TProps & { trigger?: Trigger }> = (props) => (
        <ActionMenuComponent
          compiledSchema={compiledSchema}
          defaultTrigger={defaultOptions?.trigger}
          contextProps={props}
        />
      );

      ActionMenu.displayName = "ActionMenu";
      return ActionMenu;
    },
  };
}
