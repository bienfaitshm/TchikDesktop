import { describe, it, expect } from "vitest";
import { isIn, findMenus, mapDialogItems } from "./utils";
import type { MenuItemConfig } from "./types";

describe("Utility Functions", () => {
  describe("isIn", () => {
    it("should return true if value exists in array", () => {
      expect(isIn("admin", ["user", "admin"])).toBe(true);
    });

    it("should return false if value does not exist in array", () => {
      expect(isIn("guest", ["user", "admin"])).toBe(false);
    });

    it("should return true if value exists in Set", () => {
      const set = new Set(["user", "admin"]);
      expect(isIn("admin", set)).toBe(true);
    });

    it("should return false if value does not exist in Set", () => {
      const set = new Set(["user", "admin"]);
      expect(isIn("guest", set)).toBe(false);
    });

    it("should return false if value is undefined", () => {
      expect(isIn(undefined, ["user", "admin"])).toBe(false);
    });
  });

  describe("findMenus", () => {
    const mockItems: MenuItemConfig<any>[] = [
      { type: "action", key: "action-1", label: "Action 1" },
      {
        type: "submenu",
        key: "sub-1",
        label: "Submenu",
        items: [{ type: "action", key: "action-2", label: "Action 2" }],
      },
      {
        type: "group",
        key: "group-1",
        items: {
          nested: { type: "action", key: "action-3", label: "Action 3" },
        },
      },
    ];

    it("should find a top-level menu item by key", () => {
      const result = findMenus("action-1", mockItems);
      expect(result).toBeDefined();
      expect(result?.key).toBe("action-1");
    });

    it("should find a nested menu item inside a submenu array", () => {
      const result = findMenus("action-2", mockItems);
      expect(result).toBeDefined();
      expect(result?.key).toBe("action-2");
    });

    it("should find a nested menu item inside a group record dictionary", () => {
      const result = findMenus("action-3", mockItems);
      expect(result).toBeDefined();
      expect(result?.key).toBe("action-3");
    });

    it("should return undefined if key is not found", () => {
      const result = findMenus("non-existent", mockItems);
      expect(result).toBeUndefined();
    });

    it("should return undefined if items list is empty or undefined", () => {
      expect(findMenus("action-1", [])).toBeUndefined();
      expect(findMenus("action-1", undefined)).toBeUndefined();
    });
  });

  describe("mapDialogItems", () => {
    const renderFn = () => null;
    const mockItems: MenuItemConfig<any>[] = [
      {
        type: "dialog",
        key: "dialog-1",
        label: "Dialog 1",
        renderDialog: renderFn,
      },
      {
        type: "submenu",
        key: "sub-1",
        label: "Sub",
        items: [
          {
            type: "dialog",
            key: "dialog-2",
            label: "Dialog 2",
            renderDialog: renderFn,
          },
        ],
      },
    ];

    it("should extract all dialog render functions into a Map", () => {
      const registry = mapDialogItems(mockItems);
      expect(registry.size).toBe(2);
      expect(registry.get("dialog-1")).toBe(renderFn);
      expect(registry.get("dialog-2")).toBe(renderFn);
    });

    it("should return an empty Map when items are empty or undefined", () => {
      expect(mapDialogItems([]).size).toBe(0);
      expect(mapDialogItems(undefined).size).toBe(0);
    });
  });
});
