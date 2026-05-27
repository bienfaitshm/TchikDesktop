import { ipcMain, app } from "electron";
import type { BrowserWindow } from "electron";
import type { UpdateService } from "./update.service";

export class UpdateController {
  constructor(
    private readonly win: BrowserWindow,
    private readonly updateService: UpdateService,
  ) {}

  public init() {
    this.bindServiceEvents();
    this.bindIpcHandlers();
  }

  /**
   * Écoute le service et envoie les données au Renderer (Front)
   */
  private bindServiceEvents() {
    this.updateService.on("available", (available, newVersion) => {
      this.win.webContents.send("update-can-available", {
        update: available,
        version: app.getVersion(),
        newVersion,
      });
    });

    this.updateService.on("download-progress", (progressInfo) => {
      this.win.webContents.send("download-progress", progressInfo);
    });

    this.updateService.on("error", (error) => {
      this.win.webContents.send("update-error", {
        message: error.message,
        error,
      });
    });

    this.updateService.on("downloaded", () => {
      this.win.webContents.send("update-downloaded");
    });
  }

  /**
   * Écoute les demandes du Renderer
   */
  private bindIpcHandlers() {
    ipcMain.handle("check-update", async () => {
      try {
        return await this.updateService.checkForUpdates();
      } catch (error: any) {
        return { message: error.message, error };
      }
    });

    ipcMain.handle("start-download", async () => {
      try {
        await this.updateService.startDownload();
      } catch (error: any) {
        this.win.webContents.send("update-error", {
          message: error.message,
          error,
        });
      }
    });

    ipcMain.handle("quit-and-install", () => {
      this.updateService.quitAndInstall();
    });
  }
}
