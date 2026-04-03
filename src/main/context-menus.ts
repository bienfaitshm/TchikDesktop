import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  Event,
  ContextMenuParams,
} from "electron";

/**
 * Génère le template du menu contextuel basé sur les paramètres du clic.
 */
export function createContextMenuTemplate(
  webContents: Electron.WebContents,
  params: ContextMenuParams,
): MenuItemConstructorOptions[] {
  const template: MenuItemConstructorOptions[] = [];

  // 1. Suggestions d'orthographe
  if (params.dictionarySuggestions.length > 0) {
    params.dictionarySuggestions.forEach((suggestion) => {
      template.push({
        label: suggestion,
        click: () => webContents.replaceMisspelling(suggestion),
      });
    });
    template.push({ type: "separator" });
  }

  // 2. Actions d'édition (si le champ est éditable)
  if (params.isEditable) {
    template.push(
      { role: "cut", label: "Couper" },
      { role: "copy", label: "Copier" },
      { role: "paste", label: "Coller" },
    );
  }

  return template;
}

/**
 * Initialise l'écouteur de menu contextuel pour une fenêtre donnée.
 */
export function registerContextMenuListener(window: BrowserWindow): void {
  window.webContents.on(
    "context-menu",
    (_event: Event, params: ContextMenuParams) => {
      const template = createContextMenuTemplate(window.webContents, params);

      if (template.length > 0) {
        const menu = Menu.buildFromTemplate(template);
        menu.popup();
      }
    },
  );
}
