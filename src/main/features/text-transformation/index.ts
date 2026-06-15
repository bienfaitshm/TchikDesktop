import { BrowserWindow, Menu } from "electron";
import { ContextMenuBuilder } from "./context-menu-builder";
import { TextShortcutManager } from "./shortcut-manager";

export function initializeTextModifiers(window: BrowserWindow): void {
  TextShortcutManager.register(window);
  window.webContents.on("context-menu", (_, params) => {
    const builder = new ContextMenuBuilder(window.webContents, params);
    const template = builder.build();

    if (template.length > 0) {
      Menu.buildFromTemplate(template).popup();
    }
  });
}
