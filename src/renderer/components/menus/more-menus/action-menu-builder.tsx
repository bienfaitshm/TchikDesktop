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
  Trigger,
  IMenuItemBuilder,
  DynamicLabel,
  DynamicIcon,
  ExtendedMenuItemConfig,
} from "./types";
import { isIn, mapDialogItems } from "./utils";
import {
  DialogContainer,
  DialogMenuProvider,
  useDialogActions,
} from "./context";

/**
 * Manages the asynchronous execution state for interactions.
 * @returns Object containing the pending boolean flag and the execution wrapper function.
 */
function useAsyncAction() {
  const [isPending, setIsPending] = useState(false);

  const execute = async (
    promiseFn: () => void | Promise<void>,
    e?: Event | React.SyntheticEvent,
  ) => {
    if (e && "preventDefault" in e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const result = promiseFn();
    if (result instanceof Promise) {
      setIsPending(true);
      try {
        await result;
      } finally {
        setIsPending(false);
      }
    }
  };

  return { isPending, execute };
}

/**
 * Fluent builder class for constructing strictly typed menu item configurations.
 * @template TProps - The contextual property type injected at runtime.
 */
export class MenuItemBuilder<TProps> implements IMenuItemBuilder<TProps> {
  config: Partial<ExtendedMenuItemConfig<TProps>>;

  /**
   * Initializes a new menu item builder.
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
    (this.config as any).renderDialog = render;
    return this;
  }

  /**
   * Configures the item to navigate to a provided URL.
   * @param url - The routing destination.
   * @returns The current builder instance.
   */
  public link(url: DynamicProp<TProps, string>): this {
    this.config.type = "link";
    (this.config as any).url = url;
    return this;
  }

  /**
   * Configures a standard clickable action item.
   * @param onClick - The handler to execute on selection.
   * @returns The current builder instance.
   */
  public action(onClick: (props: TProps) => void | Promise<void>): this {
    this.config.type = "action";
    (this.config as any).onAction = onClick;
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
    onChange: (props: TProps, checked: boolean) => void | Promise<void>,
  ): this {
    this.config.type = "toggle";
    (this.config as ToggleItemConfig<TProps>).isChecked = checked;
    (this.config as ToggleItemConfig<TProps>).onToggleChange = onChange;
    return this;
  }

  /**
   * Configures the item to render a nested submenu.
   * @param items - Child elements forming the nested menu.
   * @returns The current builder instance.
   */
  public submenu(
    items: MenuSchemaInput<TProps> | ExtendedMenuItemConfig<TProps>[],
  ): this {
    this.config.type = "submenu";
    (this.config as SubmenuItemConfig<TProps>).items = normalizeSchema(items);
    return this;
  }

  /**
   * Configures the item to act as a group wrapper for nested items.
   * @param items - Child elements forming the group.
   * @returns The current builder instance.
   */
  public group(
    items: MenuSchemaInput<TProps> | ExtendedMenuItemConfig<TProps>[],
  ): this {
    this.config.type = "group";

    (this.config as GroupItemConfig<TProps>).items = normalizeSchema(items);
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
   * Decorates the item with a destructive (danger) visual intent.
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
   * @param classes - The class string payload.
   * @returns The current builder instance.
   */
  public className(className: DynamicProp<TProps, string>): this {
    this.config.className = className;
    return this;
  }

  /**
   * Finalizes the builder operations and returns the finalized configuration object.
   * @returns The read-only configuration payload.
   */
  public build(): ExtendedMenuItemConfig<TProps> {
    return this.config as ExtendedMenuItemConfig<TProps>;
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
 * @param schema - Object maps or direct configuration arrays.
 * @returns Array representing strictly typed configuration nodes.
 */
function normalizeSchema<TProps>(
  schema: MenuSchemaInput<TProps> | ExtendedMenuItemConfig<TProps>[],
): ExtendedMenuItemConfig<TProps>[] {
  if (Array.isArray(schema)) return schema;

  return Object.entries(schema).map(([key, entry]) => {
    const parsedMenu = entry instanceof MenuItemBuilder ? entry.build() : entry;
    return { key, ...parsedMenu } as ExtendedMenuItemConfig<TProps>;
  });
}

/**
 * Computes and renders internal fragments for dynamic icons and labels.
 * @param props - Contains the underlying item configuration and context parameters.
 * @returns Fragment containing icon, label, and shortcut elements.
 */
const MenuItemContent = memo(function MenuItemContent<TProps>({
  item,
  contextProps,
  isLoading = false,
}: {
  item: ExtendedMenuItemConfig<TProps>;
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
}) as <TProps>(props: {
  item: ExtendedMenuItemConfig<TProps>;
  contextProps: TProps;
  isLoading?: boolean;
}) => React.ReactElement;
// MenuItemContent.displayName = "MenuItemContent";

interface SharedRendererProps<TProps> {
  item: ExtendedMenuItemConfig<TProps>;
  contextProps: TProps;
  itemClasses?: string;
  isDisabled?: boolean;
}

/**
 * Renders a menu item that triggers a modal dialog.
 * @param props - Core renderer attributes shared across components.
 * @returns Dropdown node integrated with dialog events.
 */
function DialogMenuItemRenderer<TProps>({
  item,
  itemClasses,
  isDisabled,
  contextProps,
}: SharedRendererProps<TProps>) {
  const { showDialog } = useDialogActions();
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      className={itemClasses}
      onClick={() => showDialog(item.key!)}
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
function ActionMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: SharedRendererProps<TProps>) {
  const { isPending, execute } = useAsyncAction();
  const actionItem = item as ActionItemConfig<TProps>;

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
function LinkMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: SharedRendererProps<TProps>) {
  const url =
    resolveDynamicValue((item as LinkItemConfig<TProps>).url, contextProps) ??
    "#";
  return (
    <DropdownMenuItem
      disabled={isDisabled}
      render={
        <Link to={url} className={itemClasses}>
          <MenuItemContent contextProps={contextProps} item={item} />
        </Link>
      }
    ></DropdownMenuItem>
  );
}

/**
 * Renders a menu item that toggles a boolean state.
 * @param props - Core renderer attributes shared across components.
 * @returns Toggleable structural component locked securely during mutations.
 */
function ToggleMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: SharedRendererProps<TProps>) {
  const toggleItem = item as ToggleItemConfig<TProps>;
  const { isPending, execute } = useAsyncAction();

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
function GroupMenuItemRenderer<TProps>({
  item,
  contextProps,
}: SharedRendererProps<TProps>) {
  const children = normalizeSchema((item as GroupItemConfig<TProps>).items);
  const resolvedLabel = resolveDynamicValue(item.label, contextProps);

  return (
    <DropdownMenuGroup>
      {resolvedLabel && <DropdownMenuLabel>{resolvedLabel}</DropdownMenuLabel>}
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
 * Renders a structural nested submenu spanning horizontally.
 * @param props - Core renderer attributes shared across components.
 * @returns Functional submenu spanning nested layouts horizontally.
 */
function SubmenuMenuItemRenderer<TProps>({
  item,
  contextProps,
  itemClasses,
  isDisabled,
}: SharedRendererProps<TProps>) {
  const children = normalizeSchema((item as SubmenuItemConfig<TProps>).items);
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isDisabled} className={itemClasses}>
        <MenuItemContent contextProps={contextProps} item={item} />
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

const RENDERER_MAP: Record<
  string,
  React.ElementType<SharedRendererProps<any>>
> = {
  dialog: DialogMenuItemRenderer,
  action: ActionMenuItemRenderer,
  link: LinkMenuItemRenderer,
  toggle: ToggleMenuItemRenderer,
  group: GroupMenuItemRenderer,
  submenu: SubmenuMenuItemRenderer,
};

/**
 * Selects the appropriate internal renderer based on the item configuration.
 * @param props - The core layout properties linking rendering layers.
 * @returns Extracted components enriched by lifecycle dependencies.
 */
const MenuItemRenderer = memo(function MenuItemRenderer<TProps>({
  item,
  contextProps,
}: {
  item: ExtendedMenuItemConfig<TProps>;
  contextProps: TProps;
}): React.ReactNode {
  if (resolveDynamicValue(item.isHidden, contextProps)) return null;

  const isDisabled =
    resolveDynamicValue(item.isDisabled, contextProps) ?? false;
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
      />
      {showAfterSeparator && <DropdownMenuSeparator />}
    </>
  );
}) as <TProps>(props: {
  item: ExtendedMenuItemConfig<TProps>;
  contextProps: TProps;
}) => React.ReactElement;
(MenuItemRenderer as unknown as React.FC).displayName = "MenuItemRenderer";

interface ActionMenuProps<TProps> {
  items: ExtendedMenuItemConfig<TProps>[];
  defaultTrigger?: Trigger<TProps>;
  contextProps: TProps & { trigger?: Trigger<TProps> };
}

/**
 * Initializes the dropdown structural UI encapsulating provider interactions.
 * @param props - Data nodes combined with structural trigger parameters.
 * @returns Comprehensive menu handling interactions.
 */
function ActionMenuComponent<TProps>({
  items,
  defaultTrigger,
  contextProps,
}: ActionMenuProps<TProps>): React.ReactElement {
  const dialogItems = mapDialogItems(items);
  const TriggerComponent = contextProps.trigger ?? defaultTrigger;

  return (
    <DialogMenuProvider>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            TriggerComponent ? TriggerComponent(contextProps) : <ButtonMenu />
          }
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
ActionMenuComponent.displayName = "ActionMenuComponent";

/**
 * Factory constructing reusable interface definitions supporting nested compositions.
 * @returns Interface handling generic builder instantiations securely.
 */
export function createMenuBuilder<TProps>() {
  return {
    label: (label: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) =>
      new MenuItemBuilder<TProps>(label, icon),

    group: (label?: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) =>
      new MenuItemBuilder<TProps>(label, icon).group([]),

    submenu: (label: DynamicLabel<TProps>, icon?: DynamicIcon<TProps>) =>
      new MenuItemBuilder<TProps>(label, icon),

    build: (
      schema: MenuSchemaInput<TProps> | ExtendedMenuItemConfig<TProps>[],
      defaultOptions?: { trigger?: Trigger<TProps> },
    ): React.FC<TProps & { trigger?: Trigger<TProps> }> => {
      const compiledItems = normalizeSchema(schema);

      const ActionMenu: React.FC<TProps & { trigger?: Trigger<TProps> }> = (
        props,
      ) => (
        <ActionMenuComponent
          items={compiledItems}
          defaultTrigger={defaultOptions?.trigger}
          contextProps={props}
        />
      );

      ActionMenu.displayName = "ActionMenu";
      return memo(ActionMenu);
    },
  };
}
