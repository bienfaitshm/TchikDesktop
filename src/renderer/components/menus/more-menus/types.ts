import { MenuTriggerState } from "@base-ui/react";
import type { ComponentRenderFn, HTMLProps } from "@base-ui/react/types";
import type {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ElementType,
} from "react";

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
  | ReactElement<unknown, string | JSXElementConstructor<any>>
  | ComponentRenderFn<HTMLProps, MenuTriggerState>;

/**
 * Utility type combining props with optional trigger element.
 */
export type WithPropsChildren<T> = T & { children?: Trigger };

/**
 * Value that can be provided statically or computed dynamically from props.
 */
export type DynamicProp<TProps, TValue> = TValue | ((props: TProps) => TValue);

export type DynamicLabel<TProps> = DynamicProp<TProps, ReactNode>;
export type DynamicIcon<TProps> = DynamicProp<TProps, ElementType>;

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
  className?: DynamicProp<TProps, string>;
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
  onAction?: (props: TProps) => void | Promise<void>;
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
  renderDialog: (options: DialogRenderProps<TProps>) => ReactNode;
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
  onToggleChange: (props: TProps, checked: boolean) => void | Promise<void>;
}

/**
 * Configuration types for collection elements.
 */
export type MenuItemsCollection<TProps, TKey extends string = string> =
  MenuItemConfig<TProps, TKey>[] | Record<string, MenuItemConfig<TProps, TKey>>;

/**
 * Configuration for grouped collections of menu items.
 */
export interface GroupItemConfig<
  TProps,
  TKey extends string = string,
> extends BaseMenuItemConfig<TProps, TKey> {
  type: "group";
  label?: DynamicLabel<TProps>;
  items: MenuItemsCollection<TProps, TKey>;
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
  items: MenuItemsCollection<TProps, TKey>;
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
 * Extended menu item configuration ensuring support for dynamic properties and builder outputs.
 */
export type ExtendedMenuItemConfig<
  TProps,
  TKey extends string = string,
> = MenuItemConfig<TProps, TKey> & {
  label?: DynamicLabel<TProps>;
  icon?: DynamicIcon<TProps>;
  className?: DynamicProp<TProps, string>;
};

/**
 * Dictionary or builder map accepted as input for menu schema definitions.
 */
export type MenuSchemaInput<TProps, TKey extends string = string> = Record<
  string,
  IMenuItemBuilder<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>
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
  config: Partial<ExtendedMenuItemConfig<TProps, TKey>>;

  /**
   * Sets the primary label and optional icon for the menu item.
   * @param text - Static label or evaluator function returning text.
   * @param icon - Optional visual icon component or node.
   * @returns The builder instance for chaining.
   */
  label(text: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>): this;

  /**
   * Configures the item to trigger a dialog component.
   * @param render - Callback providing dialog control props and context.
   * @returns The builder instance for chaining.
   */
  dialog(render: (options: DialogRenderProps<TProps>) => ReactNode): this;

  /**
   * Configures the item as a navigation link.
   * @param url - URL string or dynamic URL evaluator function.
   * @returns The builder instance for chaining.
   */
  link(url: DynamicProp<TProps, string>): this;

  /**
   * Configures the item as a standard action.
   * @param onClick - Callback receiving context properties.
   * @returns The builder instance for chaining.
   */
  action(onClick: (props: TProps) => void | Promise<void>): this;

  /**
   * Configures the item as a toggleable checkbox item.
   * @param checked - Boolean or dynamic evaluator function for state.
   * @param onChange - Callback executed upon state mutation.
   * @returns The builder instance for chaining.
   */
  toggle(
    checked: DynamicProp<TProps, boolean>,
    onChange: (props: TProps, checked: boolean) => void | Promise<void>,
  ): this;

  /**
   * Configures child items for submenus.
   * @param items - Definitions or array of configurations.
   * @returns The builder instance for chaining.
   */
  submenu(
    items:
      MenuSchemaInput<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>[],
  ): this;

  /**
   * Configures the item as a grouped collection of menu items.
   * @param items - Definitions or builder instances.
   * @returns The builder instance for chaining.
   */
  group(
    items:
      MenuSchemaInput<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>[],
  ): this;

  /**
   * Sets a dynamic or static disabled condition.
   * @param condition - Boolean or evaluator function determining disabled state.
   * @returns The builder instance for chaining.
   */
  disabled(condition: DynamicProp<TProps, boolean>): this;

  /**
   * Sets a dynamic or static visibility condition.
   * @param condition - Boolean or evaluator function determining hidden state.
   * @returns The builder instance for chaining.
   */
  hidden(condition: DynamicProp<TProps, boolean>): this;

  /**
   * Sets the visual separator position for this item.
   * @param position - Layout mode.
   * @returns The builder instance for chaining.
   */
  separator(position?: SeparatorPosition): this;

  /**
   * Sets the item visual variant to destructive styling.
   * @returns The builder instance for chaining.
   */
  destructive(): this;

  /**
   * Assigns a keyboard shortcut label to the item.
   * @param shortcutString - String representing the keyboard shortcut.
   * @returns The builder instance for chaining.
   */
  shortcut(shortcutString: string): this;

  /**
   * Applies supplementary CSS classes dynamically or statically.
   * @param classNameValue - Class string payload or resolver.
   * @returns The builder instance for chaining.
   */
  className(classNameValue: DynamicProp<TProps, string>): this;

  /**
   * Finalizes and builds the immutable item configuration object.
   * @returns The compiled ExtendedMenuItemConfig instance.
   */
  build(): ExtendedMenuItemConfig<TProps, TKey>;
}
