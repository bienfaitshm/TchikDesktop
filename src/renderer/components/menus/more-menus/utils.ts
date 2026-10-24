import type { DialogItemConfig, MenuItemConfig } from "./types";

/**
 * Converts a menu items collection (array or record dictionary) into a flat array.
 * @template T - The type of context properties.
 * @param items - Array or record of menu item configurations.
 * @returns An array of menu item configurations.
 */
function normalizeItems<T>(
  items?: MenuItemConfig<T>[] | Record<string, MenuItemConfig<T>>,
): MenuItemConfig<T>[] {
  if (!items) {
    return [];
  }
  return Array.isArray(items) ? items : Object.values(items);
}

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

  return (config as ReadonlyArray<string>).includes(value);
}

/**
 * Recursively searches for a menu item matching a specific key within a menu tree.
 * @template T - The type of context properties passed to the menu items.
 * @param key - The unique identifier of the menu item to find.
 * @param items - Optional collection of menu item configurations to search through.
 * @returns The matching MenuItemConfig object if found; otherwise, undefined.
 */
export function findMenus<T>(
  key: string,
  items?: MenuItemConfig<T>[] | Record<string, MenuItemConfig<T>>,
): MenuItemConfig<T> | undefined {
  const normalizedItems = normalizeItems(items);
  if (normalizedItems.length === 0) {
    return undefined;
  }

  for (const item of normalizedItems) {
    if (item.key === key) {
      return item;
    }

    if ((item.type === "submenu" || item.type === "group") && item.items) {
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
 * @template T - The type of context properties.
 * @param items - Collection of menu item configurations to process.
 * @returns A Map linking dialog keys to their render functions.
 */
export function mapDialogItems<T>(
  items?: MenuItemConfig<T>[] | Record<string, MenuItemConfig<T>>,
): Map<string, DialogItemConfig<T>["renderDialog"]> {
  const dialogRegistry = new Map<string, DialogItemConfig<T>["renderDialog"]>();

  function extractDialogs(
    nodes: MenuItemConfig<T>[] | Record<string, MenuItemConfig<T>> | undefined,
  ): void {
    const normalizedNodes = normalizeItems(nodes);
    for (const node of normalizedNodes) {
      if (node.type === "dialog" && node.key) {
        dialogRegistry.set(node.key, node.renderDialog);
      } else if (
        (node.type === "submenu" || node.type === "group") &&
        node.items
      ) {
        extractDialogs(node.items);
      }
    }
  }

  extractDialogs(items);
  return dialogRegistry;
}
