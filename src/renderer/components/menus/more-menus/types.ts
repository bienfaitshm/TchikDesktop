import type { ComponentRenderFn, HTMLProps } from "@base-ui/react/types";

/**
 * Union of supported action element types.
 */
export type ActionType =
  "dialog" | "link" | "toggle" | "action" | "group" | "submenu";

/**
 * Position options for visual separators around menu items.
 */
export type SeparatorPosition = "before" | "after" | "both" | "none";

/**
 * Render function signature for custom component triggers.
 */
export type Trigger<TProps> = (
  props: TProps,
) => React.ReactNode | ComponentRenderFn<HTMLProps, unknown>;

/**
 * Value that can be provided statically or computed dynamically from props.
 */
export type DynamicProp<TProps, TValue> = TValue | ((props: TProps) => TValue);

export type DynamicLabel<TProps> = DynamicProp<TProps, React.ReactNode>;
export type DynamicIcon<TProps> = DynamicProp<TProps, React.ElementType>;

export type ExtendedMenuItemConfig<TProps> = MenuItemConfig<TProps> & {
  label?: DynamicLabel<TProps>;
  icon?: DynamicIcon<TProps>;
  className?: DynamicProp<TProps, string>;
};

/**
 * Context properties passed to dialog rendering functions.
 */
export interface DialogRenderProps<TProps> {
  props: TProps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  close: () => void;
}

/**
 * Base configuration properties shared across all menu items.
 */
export interface BaseMenuItemConfig<TProps> {
  key: string;
  label?: DynamicLabel<TProps>;
  icon?: DynamicIcon<TProps>;
  separatorPos?: SeparatorPosition;
  variant?: "default" | "destructive";
  shortcut?: string;
  isDisabled?: DynamicProp<TProps, boolean>;
  isHidden?: DynamicProp<TProps, boolean>;
  customClass?: string;
}

/**
 * Configuration for direct execution action items.
 */
export interface ActionItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "action";
  label: DynamicLabel<TProps>;
  onAction?: (props: TProps) => void;
}

/**
 * Configuration for anchor link navigation items.
 */
export interface LinkItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "link";
  label: DynamicLabel<TProps>;
  url: DynamicProp<TProps, string>;
}

/**
 * Configuration for modal dialog trigger items.
 */
export interface DialogItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "dialog";
  label: DynamicLabel<TProps>;
  renderDialog: (options: DialogRenderProps<TProps>) => React.ReactNode;
}

/**
 * Configuration for binary toggle/checkbox items.
 */
export interface ToggleItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "toggle";
  label: DynamicLabel<TProps>;
  isChecked: DynamicProp<TProps, boolean>;
  onToggleChange: (props: TProps, checked: boolean) => void;
}

/**
 * Configuration for grouped collections of menu items.
 */
export interface GroupItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "group";
  label?: string;
  items: MenuItemConfig<TProps>[] | Record<string, MenuItemConfig<TProps>>;
}

/**
 * Configuration for nested submenu containers.
 */
export interface SubmenuItemConfig<TProps> extends BaseMenuItemConfig<TProps> {
  type: "submenu";
  label: DynamicLabel<TProps>;
  items: MenuItemConfig<TProps>[] | Record<string, MenuItemConfig<TProps>>;
}

/**
 * Discriminatory union representing any valid menu item configuration.
 */
export type MenuItemConfig<TProps> =
  | ActionItemConfig<TProps>
  | LinkItemConfig<TProps>
  | DialogItemConfig<TProps>
  | ToggleItemConfig<TProps>
  | GroupItemConfig<TProps>
  | SubmenuItemConfig<TProps>;

/**
 * Dictionary or builder map accepted as input for menu schema definitions.
 */
export type MenuSchemaInput<TProps> = Record<
  string,
  IMenuItemBuilder<TProps> | MenuItemConfig<TProps>
>;

/**
 * Fluent builder pattern interface for constructing menu item configurations.
 */
export interface IMenuItemBuilder<TProps> {
  config: Partial<MenuItemConfig<TProps>>;

  /**
   * Sets the primary label and optional icon for the menu item.
   * @param text - Static label or evaluator function returning text.
   * @param icon - Optional visual icon component or node.
   */
  label(text: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>): this;

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
   * Configures child items for submenus or grouped structures.
   * @param items - Child schema definitions or array of configurations.
   */
  submenu(
    // label: DynamicLabel<TProps>,
    // icon?: DynamicIcon<TProps>,
    items: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[],
  ): this;

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
