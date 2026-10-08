import { ipcMain, BrowserWindow } from "electron";
import { USBAdapter } from "@/packages/pos-printer/usb-adapter";

/** Represents raw USB device metadata received from physical listeners. */
export type USBDevicePayload = {
  vendorId?: number;
  productId?: number;
  deviceName?: string;
};

/**
 * Initializes USB detection handlers and relays connection state changes to renderers.
 * @returns Clean-up function to remove active listeners.
 */
export function registerUsbDetectorHandlers(): () => void {
  const handleDeviceChange = async () => {
    const printers = await USBAdapter.findPrinter();
    const windows = BrowserWindow.getAllWindows();

    windows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send("printer:status-changed", {
          printers,
          hasDevices: printers.length > 0,
        });
      }
    });
  };

  const unsubscribeConnect = USBAdapter.on("connect", async () => {
    await handleDeviceChange();
  });

  const unsubscribeDisconnect = USBAdapter.on("disconnect", async () => {
    await handleDeviceChange();
  });

  ipcMain.handle("printer:get-info", async () => {
    const printers = await USBAdapter.findPrinter();
    return {
      printers,
      hasDevices: printers.length > 0,
    };
  });

  return () => {
    if (typeof unsubscribeConnect === "function") unsubscribeConnect();
    if (typeof unsubscribeDisconnect === "function") unsubscribeDisconnect();
    ipcMain.removeHandler("printer:get-info");
  };
}
