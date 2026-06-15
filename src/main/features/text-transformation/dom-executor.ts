import { WebContents } from "electron";
import { TextTransformation } from "./text-transformations";

export class DomTextExecutor {
  /**
   * Injecte dynamiquement la logique de remplacement dans le DOM d'Electron.
   */
  static execute(
    webContents: WebContents,
    transformation: TextTransformation,
  ): void {
    const clientScript = `
      (() => {
        const activeEl = document.activeElement;
        if (!activeEl) return;

        const transformFn = ${transformation.transform.toString()};

        if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
          const start = activeEl.selectionStart;
          const end = activeEl.selectionEnd;
          if (start === null || end === null || start === end) return;

          activeEl.focus();
          activeEl.setRangeText(transformFn(activeEl.value.substring(start, end)), start, end, 'select');
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const range = selection.getRangeAt(0);
          if (!range.toString().trim()) return;

          const transformed = transformFn(range.toString());
          range.deleteContents();
          range.insertNode(document.createTextNode(transformed));
        }
      })()
    `;

    webContents.executeJavaScript(clientScript);
  }
}
