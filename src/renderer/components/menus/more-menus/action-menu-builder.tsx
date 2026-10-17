import React, { memo, useState } from "react";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";
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
  DialogRenderProps,
  DynamicProp,
  GroupItemConfig,
  LinkItemConfig,
  MenuSchemaInput,
  SeparatorPosition,
  SubmenuItemConfig,
  ToggleItemConfig,
  IMenuItemBuilder,
  DynamicLabel,
  DynamicIcon,
  ExtendedMenuItemConfig,
  WithPropsChildren,
  ActionMenuProps,
} from "./types";
import { isIn, mapDialogItems } from "./utils";
import {
  DialogContainer,
  DialogMenuProvider,
  useDialogActions,
} from "./context";

/**
 * Manages asynchronous execution states and captures action results for success callbacks.
 * @template TKey - The string literal union type representing item keys.
 * @param onSuccess - Optional callback triggered upon successful execution with item key and result data.
 * @param itemKey - Optional identifier key associated with the action item.
 * @returns Object containing the pending boolean flag and the execution wrapper function.
 */
function useAsyncAction<TKey extends string = string>(
  onSuccess?: (key: TKey, data: unknown) => void,
  itemKey?: TKey,
) {
  const [isPending, setIsPending] = useState(false);

  const execute = async (
    promiseFn: () => unknown | Promise<unknown>,
    e?: Event | React.SyntheticEvent,
  ) => {
    if (e && "preventDefault" in e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const result = promiseFn();
    if (result instanceof Promise) {
      setIsPending(true);
      try {
        const resolvedData = await result;
        if (onSuccess && itemKey) {
          onSuccess(itemKey, resolvedData);
        }
        return resolvedData;
      } finally {
        setIsPending(false);
      }
    } else {
      if (onSuccess && itemKey) {
        onSuccess(itemKey, result);
      }
      return result;
    }
  };

  return { isPending, execute };
}

/**
 * Fluent builder class for constructing strictly typed menu item configurations.
 * @template TProps - The contextual property type injected at runtime.
 * @template TKey - The string literal union type representing item keys.
 */
export class MenuItemBuilder<
  TProps,
  TKey extends string = string,
> implements IMenuItemBuilder<TProps, TKey> {
  config: Partial<ExtendedMenuItemConfig<TProps, TKey>>;

  /**
   * Initializes a new menu item builder instance.
   * @param label - The dynamic or static label for the item.
   * @param icon - The dynamic or static icon component for the item.
   */
  constructor(label?: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) {
    this.config = {
      label,
      icon,
      type: "action",
      separatorPos: "none",
      variant: "default",
    };
  }

  /**
   * Sets the label and icon for the menu item.
   * @param label - The primary text label.
   * @param icon - The optional leading icon.
   * @returns The current builder instance.
   */
  public label(label: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>): this {
    this.config.label = label;
    if (icon) this.config.icon = icon;
    return this;
  }

  /**
   * Configures the item to trigger a dialog overlay.
   * @param render - The function resolving the dialog UI.
   * @returns The current builder instance.
   */
  public dialog(
    render: (options: DialogRenderProps<TProps>) => React.ReactNode,
  ): this {
    this.config.type = "dialog";
    this.config.renderDialog = render;
    return this;
  }

  /**
   * Configures the item to navigate to a provided URL.
   * @param url - The routing destination.
   * @returns The current builder instance.
   */
  public link(url: DynamicProp<TProps, string>): this {
    this.config.type = "link";
    this.config.url = url;
    return this;
  }

  /**
   * Configures a standard clickable action item.
   * @param onClick - The handler to execute on selection.
   * @returns The current builder instance.
   */
  public action(onClick: (props: TProps) => unknown | Promise<unknown>): this {
    this.config.type = "action";
    this.config.onAction = onClick;
    return this;
  }

  /**
   * Configures the item as a controllable toggle (checkbox).
   * @param checked - Evaluator for the checked state.
   * @param onChange - The handler for state mutation.
   * @returns The current builder instance.
   */
  public toggle(
    checked: DynamicProp<TProps, boolean>,
    onChange: (props: TProps, checked: boolean) => unknown | Promise<unknown>,
  ): this {
    this.config.type = "toggle";
    this.config.isChecked = checked;
    this.config.onToggleChange = onChange;
    return this;
  }

  /**
   * Configures the item to render a nested submenu.
   * @param items - Child elements forming the nested menu.
   * @returns The current builder instance.
   */
  public submenu(
    items:
      MenuSchemaInput<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>[],
  ): this {
    this.config.type = "submenu";
    this.config.items = normalizeSchema<TProps, TKey>(items);
    return this;
  }

  /**
   * Configures the item to act as a group wrapper for nested items.
   * @param items - Child elements forming the group.
   * @returns The current builder instance.
   */
  public group(
    items:
      MenuSchemaInput<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>[],
  ): this {
    this.config.type = "group";
    this.config.items = normalizeSchema<TProps, TKey>(items);
    return this;
  }

  /**
   * Applies a conditional disabled state.
   * @param condition - Function or boolean dictating interactions.
   * @returns The current builder instance.
   */
  public disabled(condition: DynamicProp<TProps, boolean>): this {
    this.config.isDisabled = condition;
    return this;
  }

  /**
   * Applies a conditional hidden state to exclude it from the DOM.
   * @param condition - Function or boolean dictating visibility.
   * @returns The current builder instance.
   */
  public hidden(condition: DynamicProp<TProps, boolean>): this {
    this.config.isHidden = condition;
    return this;
  }

  /**
   * Defines adjacent UI separators.
   * @param position - The relative location of the separator.
   * @returns The current builder instance.
   */
  public separator(position: SeparatorPosition = "after"): this {
    this.config.separatorPos = position;
    return this;
  }

  /**
   * Decorates the item with a destructive visual intent.
   * @returns The current builder instance.
   */
  public destructive(): this {
    this.config.variant = "destructive";
    return this;
  }

  /**
   * Sets a visual keyboard shortcut hint.
   * @param shortcut - The key sequence text.
   * @returns The current builder instance.
   */
  public shortcut(shortcut: string): this {
    this.config.shortcut = shortcut;
    return this;
  }

  /**
   * Applies supplementary CSS classes dynamically or statically.
   * @param className - The class string payload or resolver.
   * @returns The current builder instance.
   */
  public className(className: DynamicProp<TProps, string>): this {
    this.config.customClass = className;
    return this;
  }

  /**
   * Finalizes builder operations and returns the finalized configuration object.
   * @returns The read-only configuration payload.
   */
  public build(): ExtendedMenuItemConfig<TProps, TKey> {
    return this.config as ExtendedMenuItemConfig<TProps, TKey>;
  }
}

/**
 * Resolves context-dependent properties into strict primitive outputs.
 * @param value - The executable closure or static primitive.
 * @param props - The context values injected into closures.
 * @returns The resolved standard value.
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
 * Converts varying map/array schemas into a normalized flat array configuration.
 * @param schema - Maps or direct configuration arrays.
 * @returns Array representing strictly typed configuration nodes.
 */
function normalizeSchema<TProps, TKey extends string = string>(
  schema:
    MenuSchemaInput<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>[],
): ExtendedMenuItemConfig<TProps, TKey>[] {
  if (Array.isArray(schema)) return schema;

  return Object.entries(schema).map(([key, entry]) => {
    const parsedMenu = entry instanceof MenuItemBuilder ? entry.build() : entry;
    return { key: key as TKey, ...parsedMenu } as ExtendedMenuItemConfig<
      TProps,
      TKey
    >;
  });
}

/**
 * Computes and renders internal fragments for dynamic icons and labels.
 * @param props - Contains the underlying item configuration, context parameters, and loading state.
 * @returns Fragment containing icon, label, and shortcut elements.
 */
const MenuItemContent = memo(function MenuItemContent<
  TProps,
  TKey extends string = string,
>({
  item,
  contextProps,
  isLoading = false,
}: {
  item: ExtendedMenuItemConfig<TProps, TKey>;
  contextProps: TProps;
  isLoading?: boolean;
}) {
  const ResolvedIcon = resolveDynamicValue(
    item.icon,
    contextProps,
  ) as React.ElementType;
  const resolvedLabel = resolveDynamicValue(item.label, contextProps);

  return (
    <>
      {isLoading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" />
      ) : (
        ResolvedIcon && <ResolvedIcon className="size-4 shrink-0" />
      )}
      {resolvedLabel && <span>{resolvedLabel}</span>}
      {item.shortcut && (
        <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
      )}
    </>
  );
}) as <TProps, TKey extends string = string>(props: {
  item: ExtendedMenuItemConfig<TProps, TKey>;
  contextProps: TProps;
  isLoading?: boolean;
}) => React.ReactElement;

interface SharedRendererProps<TProps, TKey extends string = string> {
  item: ExtendedMenuItemConfig<TProps, TKey>;
  contextProps: TProps;
  itemClasses?: string;
  isDisabled?: boolean;
  disabledKeys?: TKey[];
  hiddenKeys?: TKey[];
  onSuccess?: (key: TKey, data: unknown) => void;
}

/**
 * Renders a menu item that triggers a modal dialog.
 * @param props - Core renderer attributes shared across components.
 * @returns Dropdown node integrated with dialog events.
 */
function DialogMenuItemRenderer<TProps, TKey extends string = string>({
  item,
  itemClasses,
  isDisabled,
  contextProps,
}: SharedRendererProps<TProps, TKey>) {
  const { showDialog } = useDialogActions();
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      className={itemClasses}
      onClick={() => item.key && showDialog(item.key)}
    >
      <MenuItemContent contextProps={contextProps} item={item} />
    </DropdownMenuItem>
  );
}

/**
 * Renders a menu item that executes an asynchronous action.
 * @param props - Core renderer attributes shared across components.
 * @returns Dropdown node firing custom runtime logic.
 */
function ActionMenuItemRenderer<TProps, TKey extends string = string>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
  onSuccess,
}: SharedRendererProps<TProps, TKey>) {
  const { isPending, execute } = useAsyncAction(onSuccess, item.key);
  const actionItem = item as ActionItemConfig<TProps, TKey>;

  return (
    <DropdownMenuItem
      disabled={isDisabled || isPending}
      className={itemClasses}
      onSelect={(e) => execute(() => actionItem.onAction?.(contextProps), e)}
    >
      <MenuItemContent
        contextProps={contextProps}
        item={item}
        isLoading={isPending}
      />
    </DropdownMenuItem>
  );
}

/**
 * Renders a menu item that acts as a router link.
 * @param props - Core renderer attributes shared across components.
 * @returns Node linked to the application router framework.
 */
function LinkMenuItemRenderer<TProps, TKey extends string = string>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: SharedRendererProps<TProps, TKey>) {
  const url =
    resolveDynamicValue(
      (item as LinkItemConfig<TProps, TKey>).url,
      contextProps,
    ) ?? "#";
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      render={
        <Link to={url} className={itemClasses}>
          <MenuItemContent contextProps={contextProps} item={item} />
        </Link>
      }
    />
  );
}

/**
 * Renders a menu item that toggles a boolean state.
 * @param props - Core renderer attributes shared across components.
 * @returns Toggleable structural component locked securely during mutations.
 */
function ToggleMenuItemRenderer<TProps, TKey extends string = string>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
  onSuccess,
}: SharedRendererProps<TProps, TKey>) {
  const toggleItem = item as ToggleItemConfig<TProps, TKey>;
  const { isPending, execute } = useAsyncAction(onSuccess, item.key);

  return (
    <DropdownMenuCheckboxItem
      disabled={isDisabled || isPending}
      checked={resolveDynamicValue(toggleItem.isChecked, contextProps) ?? false}
      onCheckedChange={(checked) =>
        execute(() => toggleItem.onToggleChange(contextProps, checked))
      }
      onSelect={(e) => {
        if (isPending) e.preventDefault();
      }}
      className={itemClasses}
    >
      <MenuItemContent
        contextProps={contextProps}
        item={item}
        isLoading={isPending}
      />
    </DropdownMenuCheckboxItem>
  );
}

/**
 * Renders a static group wrapper for nested items.
 * @param props - Core renderer attributes shared across components.
 * @returns Group wrapper mapping inner definitions recursively.
 */
function GroupMenuItemRenderer<TProps, TKey extends string = string>({
  item,
  contextProps,
  disabledKeys,
  hiddenKeys,
  onSuccess,
}: SharedRendererProps<TProps, TKey>) {
  const children = normalizeSchema<TProps, TKey>(
    (item as GroupItemConfig<TProps, TKey>).items,
  );
  const resolvedLabel = resolveDynamicValue(item.label, contextProps);

  return (
    <DropdownMenuGroup>
      {resolvedLabel && <DropdownMenuLabel>{resolvedLabel}</DropdownMenuLabel>}
      {children.map((child, index) => (
        <MenuItemRenderer
          key={child.key ?? index}
          item={child}
          contextProps={contextProps}
          disabledKeys={disabledKeys}
          hiddenKeys={hiddenKeys}
          onSuccess={onSuccess}
        />
      ))}
    </DropdownMenuGroup>
  );
}

/**
 * Renders a structural nested submenu spanning horizontally.
 * @param props - Core renderer attributes shared across components.
 * @returns Functional submenu spanning nested layouts horizontally.
 */
function SubmenuMenuItemRenderer<TProps, TKey extends string = string>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
  disabledKeys,
  hiddenKeys,
  onSuccess,
}: SharedRendererProps<TProps, TKey>) {
  const children = normalizeSchema<TProps, TKey>(
    (item as SubmenuItemConfig<TProps, TKey>).items,
  );
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isDisabled} className={itemClasses}>
        <MenuItemContent contextProps={contextProps} item={item} />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {children.map((child, index) => (
          <MenuItemRenderer
            key={child.key ?? index}
            item={child}
            contextProps={contextProps}
            disabledKeys={disabledKeys}
            hiddenKeys={hiddenKeys}
            onSuccess={onSuccess}
          />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

const RENDERER_MAP: Record<
  string,
  React.ElementType<SharedRendererProps<any, any>>
> = {
  dialog: DialogMenuItemRenderer,
  action: ActionMenuItemRenderer,
  link: LinkMenuItemRenderer,
  toggle: ToggleMenuItemRenderer,
  group: GroupMenuItemRenderer,
  submenu: SubmenuMenuItemRenderer,
};

/**
 * Selects the appropriate internal renderer based on item configuration and global constraints.
 * @param props - Layout properties linking rendering layers and global disable/hide lists.
 * @returns Extracted components enriched by lifecycle dependencies.
 */
const MenuItemRenderer = memo(function MenuItemRenderer<
  TProps,
  TKey extends string = string,
>({
  item,
  contextProps,
  disabledKeys = [],
  hiddenKeys = [],
  onSuccess,
}: {
  item: ExtendedMenuItemConfig<TProps, TKey>;
  contextProps: TProps;
  disabledKeys?: TKey[];
  hiddenKeys?: TKey[];
  onSuccess?: (key: TKey, data: unknown) => void;
}): React.ReactNode {
  const isHiddenByCondition = resolveDynamicValue(item.isHidden, contextProps);
  const isHiddenByKey = item.key ? hiddenKeys.includes(item.key) : false;
  if (isHiddenByCondition || isHiddenByKey) return null;

  const isDisabledByCondition =
    resolveDynamicValue(item.isDisabled, contextProps) ?? false;
  const isDisabledByKey = item.key ? disabledKeys.includes(item.key) : false;
  const isDisabled = isDisabledByCondition || isDisabledByKey;

  const showBeforeSeparator = isIn(item.separatorPos, ["before", "both"]);
  const showAfterSeparator = isIn(item.separatorPos, ["after", "both"]);
  const customClass = resolveDynamicValue(item.customClass, contextProps);

  const itemClasses = cn(
    "gap-2 cursor-pointer flex items-center",
    item.variant === "destructive" &&
      "text-destructive focus:text-destructive focus:bg-destructive/10",
    customClass,
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
        disabledKeys={disabledKeys}
        hiddenKeys={hiddenKeys}
        onSuccess={onSuccess}
      />
      {showAfterSeparator && <DropdownMenuSeparator />}
    </>
  );
}) as <TProps, TKey extends string = string>(props: {
  item: ExtendedMenuItemConfig<TProps, TKey>;
  contextProps: TProps;
  disabledKeys?: TKey[];
  hiddenKeys?: TKey[];
  onSuccess?: (key: TKey, data: unknown) => void;
}) => React.ReactElement;
(MenuItemRenderer as unknown as React.FC).displayName = "MenuItemRenderer";

/**
 * Initializes the dropdown structural UI encapsulating provider interactions and global filtering rules.
 * @param props - Data nodes combined with structural trigger parameters, disable/hide lists, and success callbacks.
 * @returns Comprehensive menu handling interactions.
 */
function ActionMenuComponent<TProps, TKey extends string = string>({
  items,
  children = <ButtonMenu />,
  contextProps,
  disabled = [],
  hidden = [],
  onSuccess,
}: WithPropsChildren<ActionMenuProps<TProps, TKey>>): React.ReactElement {
  const dialogItems = mapDialogItems(items);

  return (
    <DialogMenuProvider>
      <DropdownMenu>
        <DropdownMenuTrigger render={children} />
        <DropdownMenuContent align="end" className="min-w-xs">
          {items.map((item, index) => (
            <MenuItemRenderer
              key={item.key ?? index}
              item={item}
              contextProps={contextProps}
              disabledKeys={disabled}
              hiddenKeys={hidden}
              onSuccess={onSuccess}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContainer contextProps={contextProps} items={dialogItems} />
    </DialogMenuProvider>
  );
}
ActionMenuComponent.displayName = "ActionMenuComponent";

/**
 * Factory constructing reusable interface definitions supporting nested compositions.
 * @template TProps - The contextual property type injected at runtime.
 * @template TKey - The string literal union type representing item keys.
 * @returns Interface handling generic builder instantiations securely.
 */
export function createMenuBuilder<TProps, TKey extends string = string>() {
  return {
    label: (label: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) =>
      new MenuItemBuilder<TProps, TKey>(label, icon),

    group: (label?: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) =>
      new MenuItemBuilder<TProps, TKey>(label, icon).group([]),

    submenu: (label: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) =>
      new MenuItemBuilder<TProps, TKey>(label, icon),

    build: (
      schema:
        MenuSchemaInput<TProps, TKey> | ExtendedMenuItemConfig<TProps, TKey>[],
    ): React.FC<
      WithPropsChildren<Omit<ActionMenuProps<TProps, TKey>, "items">>
    > => {
      const compiledItems = normalizeSchema<TProps, TKey>(schema);

      const ActionMenu: React.FC<
        WithPropsChildren<Omit<ActionMenuProps<TProps, TKey>, "items">>
      > = ({ children, disabled, hidden, onSuccess, ...props }) => (
        <ActionMenuComponent<TProps, TKey>
          items={compiledItems}
          contextProps={props as TProps}
          disabled={disabled}
          hidden={hidden}
          onSuccess={onSuccess}
        >
          {children}
        </ActionMenuComponent>
      );

      ActionMenu.displayName = "ActionMenu";
      return memo(ActionMenu);
    },
  };
}
