import {
  MenuItemConstructorOptions,
  ContextMenuParams,
  WebContents,
} from "electron";
import { transformations } from "./text-transformations";
import { DomTextExecutor } from "./dom-executor";

export class ContextMenuBuilder {
  constructor(
    private webContents: WebContents,
    private params: ContextMenuParams,
  ) {}

  public build(): MenuItemConstructorOptions[] {
    const template: MenuItemConstructorOptions[] = [];

    this.appendSpellcheckSuggestions(template);
    this.appendStandardEditActions(template);
    this.appendTransformationSubmenu(template);

    return template;
  }

  private appendSpellcheckSuggestions(
    template: MenuItemConstructorOptions[],
  ): void {
    if (this.params.dictionarySuggestions.length > 0) {
      this.params.dictionarySuggestions.forEach((suggestion) => {
        template.push({
          label: suggestion,
          click: () => this.webContents.replaceMisspelling(suggestion),
        });
      });
      template.push({ type: "separator" });
    }
  }

  private appendStandardEditActions(
    template: MenuItemConstructorOptions[],
  ): void {
    if (this.params.isEditable) {
      template.push(
        { role: "cut", label: "Couper" },
        { role: "copy", label: "Copier" },
        { role: "paste", label: "Coller" },
      );
    }
  }

  private appendTransformationSubmenu(
    template: MenuItemConstructorOptions[],
  ): void {
    const hasSelection =
      this.params.selectionText && this.params.selectionText.trim().length > 0;

    if (this.params.isEditable && hasSelection) {
      template.push({ type: "separator" });
      template.push({
        label: "Transformer le texte",
        submenu: transformations.map((transform) => ({
          label: transform.label,
          accelerator: `CommandOrControl+Shift+${transform.shortcut.toUpperCase()}`,
          click: () => DomTextExecutor.execute(this.webContents, transform),
        })),
      });
    }
  }
}
