import { ipcRenderer } from "electron";

/** Shape of hardware event payload transmitted via IPC. */
export type PrinterHardwareEvent = {
  printers: Array<{ name: string; value: string }>;
  hasDevices: boolean;
};

/** API bridge definition exposed to the renderer context. */
export const printerApi = {
  /**
   * Retrieves current system printer hardware state.
   * @returns Promise resolving to detected printer hardware payload.
   */
  getPrinterInfo: (): Promise<PrinterHardwareEvent> => {
    return ipcRenderer.invoke("printer:get-info");
  },
  /**
   * Subscribes to realtime hardware connectivity status updates.
   * @param callback Function triggered when printer status changes.
   * @returns Unsubscribe function.
   */
  onStatusChange: (
    callback: (payload: PrinterHardwareEvent) => void,
  ): (() => void) => {
    const listener = (_: unknown, payload: PrinterHardwareEvent) =>
      callback(payload);
    ipcRenderer.on("printer:status-changed", listener);
    return () => {
      ipcRenderer.removeListener("printer:status-changed", listener);
    };
  },
};

export type PrinterApi = typeof printerApi;
