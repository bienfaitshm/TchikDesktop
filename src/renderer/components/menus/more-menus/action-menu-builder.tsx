import React from "react";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
} from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import { cn } from "@/renderer/utils";
import type {
  ActionItemConfig,
  BaseMenuItemConfig,
  DialogItemConfig,
  DialogRenderProps,
  DynamicProp,
  GroupItemConfig,
  LinkItemConfig,
  MenuItemConfig,
  MenuSchemaInput,
  SeparatorPosition,
  SubmenuItemConfig,
  ToggleItemConfig,
  Trigger,
  IMenuItemBuilder,
} from "./types";
import { isIn, mapDialogItems } from "./utils";
import {
  DialogContainer,
  DialogMenuProvider,
  useDialogActions,
} from "./context";

/**
 * Fluent builder class used to construct strongly typed menu item configurations.
 * @template TProps - Context properties passed to dynamic evaluators.
 */
export class MenuItemBuilder<TProps> implements IMenuItemBuilder<TProps> {
  config: Partial<MenuItemConfig<TProps>>;

  /**
   * Initializes a new builder instance with default settings.
   * @param label - Display text for the menu item.
   * @param icon - Component reference for the menu item icon.
   */
  constructor(label?: string, icon?: React.ElementType) {
    this.config = {
      label,
      icon,
      type: "action",
      separatorPos: "none",
      variant: "default",
    };
  }

  /**
   * Configures the item to trigger a dialog component.
   * @param render - Render callback providing dialog control props and context.
   * @returns The current builder instance.
   */
  public dialog(
    render: (options: DialogRenderProps<TProps>) => React.ReactNode,
  ): this {
    this.config.type = "dialog";
    (this.config as DialogItemConfig<TProps>).renderDialog = render;
    return this;
  }

  /**
   * Configures the item as a navigation link.
   * @param url - Static URL string or dynamic URL evaluator function.
   * @returns The current builder instance.
   */
  public link(url: DynamicProp<TProps, string>): this {
    this.config.type = "link";
    (this.config as LinkItemConfig<TProps>).url = url;
    return this;
  }

  /**
   * Configures the item as a standard actionable button.
   * @param onClick - Execution callback receiving context properties.
   * @returns The current builder instance.
   */
  public action(onClick: (props: TProps) => void): this {
    this.config.type = "action";
    (this.config as ActionItemConfig<TProps>).onAction = onClick;
    return this;
  }

  /**
   * Configures the item as a toggleable checkbox.
   * @param checked - Static boolean or dynamic evaluator function for state.
   * @param onChange - Callback executed upon state mutation.
   * @returns The current builder instance.
   */
  public toggle(
    checked: DynamicProp<TProps, boolean>,
    onChange: (props: TProps, checked: boolean) => void,
  ): this {
    this.config.type = "toggle";
    (this.config as ToggleItemConfig<TProps>).isChecked = checked;
    (this.config as ToggleItemConfig<TProps>).onToggleChange = onChange;
    return this;
  }

  /**
   * Configures the item as a nested submenu container.
   * @param items - Child schema definitions or builder instances.
   * @returns The current builder instance.
   */
  public submenu(
    items: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[],
  ): this {
    this.config.type = "submenu";
    (this.config as SubmenuItemConfig<TProps>).items = normalizeSchema(items);
    return this;
  }

  /**
   * Configures the item as a grouped collection of items.
   * @param items - Child schema definitions or builder instances.
   * @returns The current builder instance.
   */
  public group(
    items: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[],
  ): this {
    this.config.type = "group";
    (this.config as GroupItemConfig<TProps>).items = normalizeSchema(items);
    return this;
  }

  /**
   * Sets a dynamic or static disabled condition.
   * @param condition - Boolean or evaluator determining disabled state.
   * @returns The current builder instance.
   */
  public disabled(condition: DynamicProp<TProps, boolean>): this {
    this.config.isDisabled = condition;
    return this;
  }

  /**
   * Sets a dynamic or static visibility condition.
   * @param condition - Boolean or evaluator determining hidden state.
   * @returns The current builder instance.
   */
  public hidden(condition: DynamicProp<TProps, boolean>): this {
    this.config.isHidden = condition;
    return this;
  }

  /**
   * Sets the visual separator layout mode.
   * @param position - Layout position for the separator.
   * @returns The current builder instance.
   */
  public separator(position: SeparatorPosition = "after"): this {
    this.config.separatorPos = position;
    return this;
  }

  /**
   * Applies destructive styling to the menu item.
   * @returns The current builder instance.
   */
  public destructive(): this {
    this.config.variant = "destructive";
    return this;
  }

  /**
   * Assigns a keyboard shortcut label.
   * @param shortcut - Text string representing the shortcut.
   * @returns The current builder instance.
   */
  public shortcut(shortcut: string): this {
    this.config.shortcut = shortcut;
    return this;
  }

  /**
   * Finalizes and builds the immutable item configuration object.
   * @returns The compiled MenuItemConfig instance.
   */
  public build(): MenuItemConfig<TProps> {
    return this.config as MenuItemConfig<TProps>;
  }
}

/**
 * Resolves a value that can be static or derived dynamically from properties.
 * @param value - Static value or function to evaluate.
 * @param props - Properties injected into the evaluator.
 * @returns The resolved static value.
 */
function resolveDynamicValue<TProps, TReturn>(
  value: DynamicProp<TProps, TReturn> | undefined,
  props: TProps,
): TReturn | undefined {
  return typeof value === "function"
    ? (value as (props: TProps) => TReturn)(props)
    : value;
}

/**
 * Normalizes input schemas into a flat array of compiled item configurations.
 * @param schema - Raw input schema mapping or array.
 * @returns An array of compiled MenuItemConfig entries.
 */
function normalizeSchema<TProps>(
  schema: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[],
): MenuItemConfig<TProps>[] {
  if (Array.isArray(schema)) return schema;

  return Object.entries(schema).map(([key, entry]) => {
    const _menu = entry instanceof MenuItemBuilder ? entry.build() : entry;
    return { key, ..._menu };
  });
}

/**
 * Renders the internal layout for a menu item including icon, label, and shortcut.
 * @param props - Configuration holding the visual definition.
 * @returns The structured content fragment.
 */
function MenuItemContent<TProps>({
  item,
}: {
  item: BaseMenuItemConfig<TProps>;
}) {
  const IconComponent = item.icon as React.ElementType;
  return (
    <>
      {IconComponent && <IconComponent className="size-4 shrink-0" />}
      {item.label && <span>{item.label}</span>}
      {item.shortcut && (
        <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
      )}
    </>
  );
}

/**
 * Renders a dialog-triggering menu item.
 * @param props - Component props containing item config and classes.
 * @returns The rendered dropdown menu item.
 */
function DialogMenuItemRenderer<TProps>({
  item,
  itemClasses,
  isDisabled,
}: {
  item: MenuItemConfig<TProps>;
  itemClasses: string;
  isDisabled: boolean;
}) {
  const { showDialog } = useDialogActions();
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      className={itemClasses}
      onClick={() => {
        showDialog(item.key!);
      }}
    >
      <MenuItemContent item={item} />
    </DropdownMenuItem>
  );
}

/**
 * Renders an actionable standard menu item.
 * @param props - Component props containing context and item details.
 * @returns The rendered dropdown menu item.
 */
function ActionMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: {
  item: MenuItemConfig<TProps>;
  contextProps: TProps;
  itemClasses: string;
  isDisabled: boolean;
}) {
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      className={itemClasses}
      onSelect={() =>
        (item as ActionItemConfig<TProps>).onAction?.(contextProps)
      }
    >
      <MenuItemContent item={item} />
    </DropdownMenuItem>
  );
}

/**
 * Renders a link-based menu item.
 * @param props - Component props containing context and item details.
 * @returns The rendered dropdown menu item wrapper.
 */
function LinkMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: {
  item: MenuItemConfig<TProps>;
  contextProps: TProps;
  itemClasses: string;
  isDisabled: boolean;
}) {
  const url =
    resolveDynamicValue((item as LinkItemConfig<TProps>).url, contextProps) ??
    "#";
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      render={
        <Link to={url} className={itemClasses}>
          <MenuItemContent item={item} />
        </Link>
      }
    ></DropdownMenuItem>
  );
}

/**
 * Renders a toggleable checkbox menu item.
 * @param props - Component props containing context and item details.
 * @returns The rendered dropdown checkbox item.
 */
function ToggleMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: {
  item: MenuItemConfig<TProps>;
  contextProps: TProps;
  itemClasses: string;
  isDisabled: boolean;
}) {
  const toggleItem = item as ToggleItemConfig<TProps>;
  return (
    <DropdownMenuCheckboxItem
      disabled={isDisabled}
      checked={resolveDynamicValue(toggleItem.isChecked, contextProps) ?? false}
      onCheckedChange={(checked) =>
        toggleItem.onToggleChange(contextProps, checked)
      }
      className={itemClasses}
    >
      <MenuItemContent item={item} />
    </DropdownMenuCheckboxItem>
  );
}

/**
 * Renders a grouped collection of menu items.
 * @param props - Component props containing context and item details.
 * @returns The rendered dropdown group.
 */
function GroupMenuItemRenderer<TProps>({
  item,
  contextProps,
}: {
  item: MenuItemConfig<TProps>;
  contextProps: TProps;
}) {
  const children = normalizeSchema((item as GroupItemConfig<TProps>).items);
  return (
    <DropdownMenuGroup>
      {item.label && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
      {children.map((child, index) => (
        <MenuItemRenderer
          key={index}
          item={child}
          contextProps={contextProps}
        />
      ))}
    </DropdownMenuGroup>
  );
}

/**
 * Renders a nested submenu.
 * @param props - Component props containing context and item details.
 * @returns The rendered dropdown submenu tree.
 */
function SubmenuMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: {
  item: MenuItemConfig<TProps>;
  contextProps: TProps;
  itemClasses: string;
  isDisabled: boolean;
}) {
  const children = normalizeSchema((item as SubmenuItemConfig<TProps>).items);
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isDisabled} className={itemClasses}>
        <MenuItemContent item={item} />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {children.map((child, index) => (
          <MenuItemRenderer
            key={index}
            item={child}
            contextProps={contextProps}
          />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

const RENDERER_MAP: Record<string, React.FC<any>> = {
  dialog: DialogMenuItemRenderer,
  action: ActionMenuItemRenderer,
  link: LinkMenuItemRenderer,
  toggle: ToggleMenuItemRenderer,
  group: GroupMenuItemRenderer,
  submenu: SubmenuMenuItemRenderer,
};

/**
 * Renders an individual menu item, handling separators and visibility.
 * @param props - The item configuration and execution context properties.
 * @returns The structured menu item component.
 */
function MenuItemRenderer<TProps>({
  item,
  contextProps,
}: {
  item: MenuItemConfig<TProps>;
  contextProps: TProps;
}): React.ReactNode {
  if (resolveDynamicValue(item.isHidden, contextProps)) return null;

  const isDisabled =
    resolveDynamicValue(item.isDisabled, contextProps) ?? false;
  const showBeforeSeparator = isIn(item.separatorPos, ["before", "both"]);
  const showAfterSeparator = isIn(item.separatorPos, ["after", "both"]);

  const itemClasses = cn(
    "gap-2 cursor-pointer flex items-center",
    item.variant === "destructive" &&
      "text-destructive focus:text-destructive focus:bg-destructive/10",
  );

  const SpecificRenderer = RENDERER_MAP[item.type];
  if (!SpecificRenderer) return null;

  return (
    <>
      {showBeforeSeparator && <DropdownMenuSeparator />}
      <SpecificRenderer
        item={item}
        contextProps={contextProps}
        itemClasses={itemClasses}
        isDisabled={isDisabled}
      />
      {showAfterSeparator && <DropdownMenuSeparator />}
    </>
  );
}

interface ActionMenuProps<TProps> {
  items: MenuItemConfig<TProps>[];
  defaultTrigger?: Trigger;
  contextProps: TProps & { trigger?: Trigger };
}

/**
 * Orchestrates the rendering of the dropdown menu tree and context triggers.
 * @param props - Contains compiled items and execution context.
 * @returns The complete DropdownMenu component wrapper.
 */
function ActionMenuComponent<TProps>({
  items,
  defaultTrigger,
  contextProps,
}: ActionMenuProps<TProps>): React.ReactElement {
  const dialogItems = mapDialogItems(items);
  return (
    <DialogMenuProvider>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={contextProps.trigger ?? defaultTrigger ?? <ButtonMenu />}
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-xs">
          {items.map((item, index) => (
            <MenuItemRenderer
              key={index}
              item={item}
              contextProps={contextProps}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContainer contextProps={contextProps} items={dialogItems} />
    </DialogMenuProvider>
  );
}

/**
 * Factory function creating a type-safe menu builder context.
 * @returns An object containing builder helpers and schema compiler.
 */
export function createMenuBuilder<TProps>() {
  return {
    label: (label: string, icon?: React.ElementType) =>
      new MenuItemBuilder<TProps>(label, icon),

    group: (label?: string, icon?: React.ElementType) =>
      new MenuItemBuilder<TProps>(label, icon).group([]),

    submenu: (label: string, icon?: React.ElementType) =>
      new MenuItemBuilder<TProps>(label, icon),

    build: (
      schema: MenuSchemaInput<TProps> | MenuItemConfig<TProps>[],
      defaultOptions?: { trigger?: Trigger },
    ): React.FC<TProps & { trigger?: Trigger }> => {
      const compiledItems = normalizeSchema(schema);

      const ActionMenu: React.FC<TProps & { trigger?: Trigger }> = (props) => (
        <ActionMenuComponent
          items={compiledItems}
          defaultTrigger={defaultOptions?.trigger}
          contextProps={props}
        />
      );

      ActionMenu.displayName = "ActionMenu";
      return ActionMenu;
    },
  };
}
