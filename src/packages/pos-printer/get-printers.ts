import { BrowserWindow } from "electron";

export async function getSystemPrinters(): Promise<Electron.PrinterInfo[]> {
  try {
    // Récupérer la fenêtre principale d'Electron
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (!mainWindow) {
      return [];
    }

    // Récupération via l'API native Electron
    const printers = await mainWindow.webContents.getPrintersAsync();

    const printersList: Electron.PrinterInfo[] = printers.map((printer) => ({
      name: printer.name,
      isDefault: printer.options,
      status: printer.status === 0 ? "ready" : "offline",
    }));

    return printersList;
  } catch (error) {
    return [];
  }
}
