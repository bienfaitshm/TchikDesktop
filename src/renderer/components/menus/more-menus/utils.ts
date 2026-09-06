import type { DialogItemConfig, MenuItemConfig } from "./types";

/**
 * Checks whether a given string value exists within a reference collection.
 * @param value - The target string to search for, or undefined.
 * @param config - The collection of valid strings, provided as an array or Set.
 * @returns True if the value is present in the configuration; otherwise, false.
 */
export function isIn(
  value: string | undefined,
  config: ReadonlyArray<string> | ReadonlySet<string> = [],
): boolean {
  if (!value) {
    return false;
  }

  if (config instanceof Set) {
    return config.has(value);
  }

  if (Array.isArray(config)) {
    return config.includes(value);
  }

  return false;
}

/**
 * Recursively searches for a menu item matching a specific key within a menu tree.
 * @template T - The type of context properties passed to the menu items.
 * @param key - The unique identifier of the menu item to find.
 * @param items - Optional array of menu item configurations to search through.
 * @returns The matching MenuItemConfig object if found; otherwise, undefined.
 */
export function findMenus<T>(
  key: string,
  items?: ReadonlyArray<MenuItemConfig<T>>,
): MenuItemConfig<T> | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }

  for (const item of items) {
    if (item.key === key) {
      return item;
    }

    if (item.type === "submenu" && item.items) {
      const foundInSubmenu = findMenus(key, item.items);
      if (foundInSubmenu) {
        return foundInSubmenu;
      }
    }
  }

  return undefined;
}

/**
 * Recursively maps dialog keys to their respective render functions from a list of menu items.
 * @param items - Array of menu item configurations to process.
 * @returns A Map linking dialog keys to their render functions.
 */
export function mapDialogItems<T>(
  items: ReadonlyArray<MenuItemConfig<T>> = [],
): Map<string, DialogItemConfig<T>["renderDialog"]> {
  const dialogRegistry = new Map<string, DialogItemConfig<T>["renderDialog"]>();

  function extractDialogs(nodes: ReadonlyArray<MenuItemConfig<T>>): void {
    for (const node of nodes) {
      if (node.type === "dialog") {
        dialogRegistry.set(node.key, node.renderDialog);
      } else if (node.type === "submenu" && node.items) {
        extractDialogs(node.items);
      }
    }
  }

  extractDialogs(items);
  return dialogRegistry;
}
