import { BrowserWindow } from "electron";
import { transformations } from "./text-transformations";
import { DomTextExecutor } from "./dom-executor";

export class TextShortcutManager {
  private static shortcutMap = new Map(
    transformations.map((t) => [t.shortcut.toLowerCase(), t]),
  );

  public static register(window: BrowserWindow): void {
    window.webContents.on("before-input-event", (event, input) => {
      if (input.type !== "keyDown") return;

      const isModifierPressed = input.meta || input.control;
      const isShiftPressed = input.shift;

      if (isModifierPressed && isShiftPressed) {
        const targetTransformation = this.shortcutMap.get(
          input.key.toLowerCase(),
        );

        if (targetTransformation) {
          event.preventDefault();
          DomTextExecutor.execute(window.webContents, targetTransformation);
        }
      }
    });
  }
}
