import type { ComponentRenderFn, HTMLProps } from "@base-ui/react/types";

export type ActionType =
  "dialog" | "link" | "toggle" | "action" | "group" | "submenu";

export type SeparatorPosition = "before" | "after" | "both" | "none";

export type Trigger =
  React.ReactElement | ComponentRenderFn<HTMLProps, unknown>;

export type DynamicProp<TProps, TValue> = TValue | ((props: TProps) => TValue);

export interface DialogRenderProps<TProps> {
  props: TProps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  close: () => void;
}

export interface BaseMenuItemConfig<TProps> {
  label?: string;
  icon?: React.ReactNode | React.ElementType;
  separatorPos?: SeparatorPosition;
  variant?: "default" | "destructive";
  shortcut?: string;
  isDisabled?: DynamicProp<TProps, boolean>;
  isHidden?: DynamicProp<TProps, boolean>;
  key: string;
}

export interface ActionItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "action";
  label: string;
  onAction?: (props: TProps) => void;
}

export interface LinkItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "link";
  label: string;
  url: DynamicProp<TProps, string>;
}

export interface DialogItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "dialog";
  label: string;
  renderDialog: (options: DialogRenderProps<TProps>) => React.ReactNode;
}

export interface ToggleItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "toggle";
  label: string;
  isChecked: DynamicProp<TProps, boolean>;
  onToggleChange: (props: TProps, checked: boolean) => void;
}

export interface GroupItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "group";
  label?: string;
  items: MenuItemConfig<TProps>[] | Record<string, MenuItemConfig<TProps>>;
}

export interface SubmenuItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "submenu";
  label: string;
  items: MenuItemConfig<TProps>[] | Record<string, MenuItemConfig<TProps>>;
}

export type MenuItemConfig<TProps> =
  | ActionItemConfig<TProps>
  | LinkItemConfig<TProps>
  | DialogItemConfig<TProps>
  | ToggleItemConfig<TProps>
  | GroupItemConfig<TProps>
  | SubmenuItemConfig<TProps>;

export type MenuSchemaInput<TProps> = Record<
  string,
  IMenuItemBuilder<TProps> | MenuItemConfig<TProps>
>;

export interface IMenuItemBuilder<TProps> {
  config: Partial<MenuItemConfig<TProps>>;

  /**
   * Configures the item to trigger a dialog component.
   * @param render - Render callback providing dialog control props and context.
   */
  dialog(render: (options: DialogRenderProps<TProps>) => React.ReactNode): this;

  /**
   * Configures the item as a navigation link.
   * @param url - Static URL string or dynamic URL evaluator function.
   */
  link(url: DynamicProp<TProps, string>): this;

  /**
   * Configures the item as a standard action.
   * @param onClick - Execution callback receiving context properties.
   */
  action(onClick: (props: TProps) => void): this;

  /**
   * Configures the item as a toggleable checkbox item.
   * @param checked - Static boolean or dynamic evaluator function for state.
   * @param onChange - Callback executed upon state mutation.
   */
  toggle(
    checked: DynamicProp<TProps, boolean>,
    onChange: (props: TProps, checked: boolean) => void,
  ): this;
  /**
   * Configures the item as a nested submenu container.
   * @param items - Child schema definitions or builder instances.
   */
  submenu(items: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[]): this;
  /**
   * Configures the item as a grouped collection of menu items.
   * @param items - Child schema definitions or builder instances.
   */
  group(items: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[]): this;
  /**
   * Sets a dynamic or static disabled condition.
   * @param condition - Boolean or evaluator function determining disabled state.
   */
  disabled(condition: DynamicProp<TProps, boolean>): this;

  /**
   * Sets a dynamic or static visibility condition.
   * @param condition - Boolean or evaluator function determining hidden state.
   */
  hidden(condition: DynamicProp<TProps, boolean>): this;

  /**
   * Sets the visual separator position for this item.
   * @param position - Separator layout mode.
   */
  separator(position?: SeparatorPosition): this;

  /**
   * Sets the item visual variant to destructive styling.
   */
  destructive(): this;
  /**
   * Assigns a keyboard shortcut label to the item.
   * @param shortcut - Text string representing the keyboard shortcut.
   */
  shortcut(shortcut: string): this;

  /**
   * Finalizes and builds the immutable item configuration object.
   * @returns The compiled MenuItemConfig instance.
   */
  build(): MenuItemConfig<TProps>;
}
