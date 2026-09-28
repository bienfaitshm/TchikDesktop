import { ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";

/**
 * Payload describing update availability status.
 */
export interface UpdateStatusPayload {
  update: boolean;
  version: string;
  newVersion?: string;
}

/**
 * Payload describing download progress metrics.
 */
export interface DownloadProgressPayload {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

/**
 * Payload describing update error details.
 */
export interface UpdateErrorPayload {
  message: string;
  error?: unknown;
}

/**
 * Function contract returned by event subscriptions to remove IPC listeners.
 */
export type UnsubscribeFunction = () => void;

/**
 * Contract defining the client-side updater IPC interface.
 */
export interface UpdaterAPI {
  /** Checks if a new application update is available. */
  checkUpdate: () => Promise<unknown>;
  /** Initiates the download of an available update. */
  startDownload: () => Promise<unknown>;
  /** Quits the application and installs the downloaded update. */
  quitAndInstall: () => Promise<void>;
  /** Registers a listener triggered when update status is determined. */
  onUpdateAvailable: (
    callback: (data: UpdateStatusPayload) => void,
  ) => UnsubscribeFunction;
  /** Registers a listener triggered to track download progress. */
  onDownloadProgress: (
    callback: (data: DownloadProgressPayload) => void,
  ) => UnsubscribeFunction;
  /** Registers a listener triggered when update download completes. */
  onUpdateDownloaded: (callback: () => void) => UnsubscribeFunction;
  /** Registers a listener triggered when an error occurs during update operations. */
  onUpdateError: (
    callback: (error: UpdateErrorPayload) => void,
  ) => UnsubscribeFunction;
}

/**
 * Subscribes to an IPC channel and returns an unsubscribe cleanup function.
 * @param channel - The target IPC channel name.
 * @param callback - The handler invoked with the received payload.
 * @returns Unsubscribe function removing the registered listener.
 */
function registerListener<T>(
  channel: string,
  callback: (data: T) => void,
): UnsubscribeFunction {
  const listener = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

/**
 * Service facilitating IPC communication with the main process auto-updater.
 */
export const Updater: UpdaterAPI = {
  checkUpdate: (): Promise<unknown> => ipcRenderer.invoke("check-update"),

  startDownload: (): Promise<unknown> => ipcRenderer.invoke("start-download"),

  quitAndInstall: (): Promise<void> => ipcRenderer.invoke("quit-and-install"),

  onUpdateAvailable: (
    callback: (data: UpdateStatusPayload) => void,
  ): UnsubscribeFunction =>
    registerListener<UpdateStatusPayload>("update-available", callback),

  onDownloadProgress: (
    callback: (data: DownloadProgressPayload) => void,
  ): UnsubscribeFunction =>
    registerListener<DownloadProgressPayload>("download-progress", callback),

  onUpdateDownloaded: (callback: () => void): UnsubscribeFunction =>
    registerListener<void>("update-downloaded", callback),

  onUpdateError: (
    callback: (error: UpdateErrorPayload) => void,
  ): UnsubscribeFunction =>
    registerListener<UpdateErrorPayload>("update-error", callback),
};
