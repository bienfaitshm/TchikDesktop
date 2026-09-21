import { ipcRenderer, IpcRendererEvent } from "electron";

export interface ElectronWindowControl {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
}

const WINDOW_IPC_CHANNELS = {
  MINIMIZE: "window:minimize",
  MAXIMIZE: "window:maximize",
  CLOSE: "window:close",
  IS_MAXIMIZED: "window:isMaximized",
  ON_MAXIMIZE_CHANGE: "window:onMaximizeChange",
} as const;

/**
 * Window control API implementation bridge for Electron preload script.
 */
export const windowControlsBridge: ElectronWindowControl = {
  /**
   * Sends an IPC message to minimize the current window.
   */
  minimize: (): void => {
    ipcRenderer.send(WINDOW_IPC_CHANNELS.MINIMIZE);
  },

  /**
   * Sends an IPC message to toggle between maximized and restored window states.
   */
  maximize: (): void => {
    ipcRenderer.send(WINDOW_IPC_CHANNELS.MAXIMIZE);
  },

  /**
   * Sends an IPC message to close the current window.
   */
  close: (): void => {
    ipcRenderer.send(WINDOW_IPC_CHANNELS.CLOSE);
  },

  /**
   * Invokes an IPC handler to check if the current window is maximized.
   * @returns A promise resolving to true if maximized, false otherwise.
   */
  isMaximized: (): Promise<boolean> => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.IS_MAXIMIZED);
  },

  /**
   * Subscribes to window maximize state change events from the main process.
   * @param callback - Function invoked with the updated boolean maximized state.
   * @returns A cleanup function to unsubscribe from the IPC event listener.
   */
  onMaximizeChange: (
    callback: (isMaximized: boolean) => void,
  ): (() => void) => {
    const listener = (_event: IpcRendererEvent, isMaximized: boolean): void => {
      callback(isMaximized);
    };

    ipcRenderer.on(WINDOW_IPC_CHANNELS.ON_MAXIMIZE_CHANGE, listener);

    return (): void => {
      ipcRenderer.off(WINDOW_IPC_CHANNELS.ON_MAXIMIZE_CHANGE, listener);
    };
  },
};
