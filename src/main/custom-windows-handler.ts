import {
  ipcMain,
  BrowserWindow,
  IpcMainEvent,
  IpcMainInvokeEvent,
} from "electron";

const WINDOW_IPC_CHANNELS = {
  MINIMIZE: "window:minimize",
  MAXIMIZE: "window:maximize",
  CLOSE: "window:close",
  IS_MAXIMIZED: "window:isMaximized",
  ON_MAXIMIZE_CHANGE: "window:onMaximizeChange",
} as const;

/**
 * Retrieves the BrowserWindow instance corresponding to the sender of an IPC event.
 * @param event - The incoming IPC event emitted by a renderer process.
 * @returns The associated BrowserWindow instance, or null if non-existent.
 */
function getWindowFromEvent(
  event: IpcMainEvent | IpcMainInvokeEvent,
): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender);
}

/**
 * Binds window state listeners to send real-time maximize changes back to the renderer process.
 * @param window - The target BrowserWindow instance to attach event listeners to.
 */
function attachWindowStateListeners(window: BrowserWindow): void {
  const notifyMaximizeState = () => {
    if (!window.isDestroyed()) {
      window.webContents.send(
        WINDOW_IPC_CHANNELS.ON_MAXIMIZE_CHANGE,
        window.isMaximized(),
      );
    }
  };

  window.off("maximize", notifyMaximizeState);
  window.off("unmaximize", notifyMaximizeState);

  window.on("maximize", notifyMaximizeState);
  window.on("unmaximize", notifyMaximizeState);
}

/**
 * Registers main-process IPC handlers for managing application window controls and state synchronization.
 */
export function registerWindowHandlers(): void {
  ipcMain.on(WINDOW_IPC_CHANNELS.MINIMIZE, (event: IpcMainEvent) => {
    getWindowFromEvent(event)?.minimize();
  });

  ipcMain.on(WINDOW_IPC_CHANNELS.MAXIMIZE, (event: IpcMainEvent) => {
    const window = getWindowFromEvent(event);
    if (!window) return;

    attachWindowStateListeners(window);

    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

  ipcMain.on(WINDOW_IPC_CHANNELS.CLOSE, (event: IpcMainEvent) => {
    getWindowFromEvent(event)?.close();
  });

  ipcMain.handle(
    WINDOW_IPC_CHANNELS.IS_MAXIMIZED,
    (event: IpcMainInvokeEvent): boolean => {
      const window = getWindowFromEvent(event);
      if (window) {
        attachWindowStateListeners(window);
        return window.isMaximized();
      }
      return false;
    },
  );
}
