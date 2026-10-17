import { MenuTriggerState } from "@base-ui/react";
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
export type Trigger =
  | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
  | ComponentRenderFn<HTMLProps, MenuTriggerState>;

export type WithPropsChildren<T> = T & { children?: Trigger };

/**
 * Value that can be provided statically or computed dynamically from props.
 */
export type DynamicProp<TProps, TValue> = TValue | ((props: TProps) => TValue);

export type DynamicLabel<TProps> = DynamicProp<TProps, React.ReactNode>;
export type DynamicIcon<TProps> = DynamicProp<TProps, React.ElementType>;

export type ExtendedMenuItemConfig<
  TProps,
  TKey extends string = string,
> = MenuItemConfig<TProps, TKey> & {
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
export interface BaseMenuItemConfig<TProps, TKey extends string = string> {
  key?: TKey;
  label?: DynamicLabel<TProps>;
  icon?: DynamicIcon<TProps>;
  separatorPos?: SeparatorPosition;
  variant?: "default" | "destructive";
  shortcut?: string;
  isDisabled?: DynamicProp<TProps, boolean>;
  isHidden?: DynamicProp<TProps, boolean>;
  customClass?: DynamicProp<TProps, string>;
}

/**
 * Configuration for direct execution action items.
 */
export interface ActionItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "action";
  label: DynamicLabel<TProps>;
  onAction?: (props: TProps) => unknown | Promise<unknown>;
}

/**
 * Configuration for anchor link navigation items.
 */
export interface LinkItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "link";
  label: DynamicLabel<TProps>;
  url: DynamicProp<TProps, string>;
}

/**
 * Configuration for modal dialog trigger items.
 */
export interface DialogItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "dialog";
  label: DynamicLabel<TProps>;
  renderDialog: (options: DialogRenderProps<TProps>) => React.ReactNode;
}

/**
 * Configuration for binary toggle/checkbox items.
 */
export interface ToggleItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "toggle";
  label: DynamicLabel<TProps>;
  isChecked: DynamicProp<TProps, boolean>;
  onToggleChange: (
    props: TProps,
    checked: boolean,
  ) => unknown | Promise<unknown>;
}

/**
 * Configuration for grouped collections of menu items.
 */
export interface GroupItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "group";
  label?: DynamicLabel<TProps>;
  items:
    | MenuItemConfig<TProps, TKey>[]
    | Record<string, MenuItemConfig<TProps, TKey>>;
}

/**
 * Configuration for nested submenu containers.
 */
export interface SubmenuItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "submenu";
  label: DynamicLabel<TProps>;
  items:
    | MenuItemConfig<TProps, TKey>[]
    | Record<string, MenuItemConfig<TProps, TKey>>;
}

/**
 * Discriminatory union representing any valid menu item configuration.
 */
export type MenuItemConfig<TProps, TKey extends string = string> =
  | ActionItemConfig<TProps, TKey>
  | LinkItemConfig<TProps, TKey>
  | DialogItemConfig<TProps, TKey>
  | ToggleItemConfig<TProps, TKey>
  | GroupItemConfig<TProps, TKey>
  | SubmenuItemConfig<TProps, TKey>;

/**
 * Dictionary or builder map accepted as input for menu schema definitions.
 */
export type MenuSchemaInput<TProps, TKey extends string = string> = Record<
  string,
  IMenuItemBuilder<TProps, TKey> | MenuItemConfig<TProps, TKey>
>;

/**
 * Properties for the root ActionMenu component supporting global overrides and callbacks based on item keys.
 * @template TProps - The type of context properties passed down to items.
 * @template TKey - The string literal union type representing item keys.
 */
export interface ActionMenuProps<TProps, TKey extends string = string> {
  items: ExtendedMenuItemConfig<TProps, TKey>[];
  contextProps: TProps;
  disabled?: TKey[];
  hidden?: TKey[];
  onSuccess?: (key: TKey, data: unknown) => void;
}

/**
 * Fluent builder pattern interface for constructing menu item configurations.
 */
export interface IMenuItemBuilder<TProps, TKey extends string = string> {
  config: Partial<MenuItemConfig<TProps, TKey>>;

  /**
   * Sets the primary label and optional icon for the menu item.
   * @param text - Static label or evaluator function returning text.
   * @param icon - Optional visual icon component or node.
   */
  label(text: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>): this;

  /**
   * Configures the item to trigger a dialog component.
   * @param render - Callback providing dialog control props and context.
   */
  dialog(render: (options: DialogRenderProps<TProps>) => React.ReactNode): this;

  /**
   * Configures the item as a navigation link.
   * @param url - URL string or dynamic URL evaluator function.
   */
  link(url: DynamicProp<TProps, string>): this;

  /**
   * Configures the item as a standard action.
   * @param onClick - Execution callback receiving context properties.
   */
  action(onClick: (props: TProps) => unknown | Promise<unknown>): this;

  /**
   * Configures the item as a toggleable checkbox item.
   * @param checked - Boolean or dynamic evaluator function for state.
   * @param onChange - Callback executed upon state mutation.
   */
  toggle(
    checked: DynamicProp<TProps, boolean>,
    onChange: (props: TProps, checked: boolean) => unknown | Promise<unknown>,
  ): this;

  /**
   * Configures child items for submenus.
   * @param items - Definitions or array of configurations.
   */
  submenu(
    items: MenuSchemaInput<TProps, TKey> | MenuItemConfig<TProps, TKey>[],
  ): this;

  /**
   * Configures the item as a grouped collection of menu items.
   * @param items - Definitions or builder instances.
   */
  group(
    items: MenuSchemaInput<TProps, TKey> | MenuItemConfig<TProps, TKey>[],
  ): this;

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
   * @param position - Layout mode.
   */
  separator(position?: SeparatorPosition): this;

  /**
   * Sets the item visual variant to destructive styling.
   */
  destructive(): this;

  /**
   * Assigns a keyboard shortcut label to the item.
   * @param shortcut - String representing the keyboard shortcut.
   */
  shortcut(shortcut: string): this;

  /**
   * Applies supplementary CSS classes dynamically or statically.
   * @param className - Class string payload or resolver.
   */
  className(className: DynamicProp<TProps, string>): this;

  /**
   * Finalizes and builds the immutable item configuration object.
   * @returns The compiled MenuItemConfig instance.
   */
  build(): MenuItemConfig<TProps, TKey>;
}
