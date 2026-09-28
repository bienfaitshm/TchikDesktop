import { ipcMain, app } from "electron";
import type { BrowserWindow } from "electron";
import type { ProgressInfo } from "electron-updater";
import type { UpdateService } from "./update.service";

/**
 * Payload representing the status of an update check.
 */
export interface UpdateStatusPayload {
  update: boolean;
  version: string;
  newVersion?: string;
}

/**
 * Payload representing update error details.
 */
export interface UpdateErrorPayload {
  message: string;
  error?: unknown;
}

/**
 * Bridge controller facilitating IPC communication between the UpdateService and Renderer.
 */
export class UpdateController {
  private readonly boundAvailableHandler: (
    available: boolean,
    newVersion?: string,
  ) => void;
  private readonly boundProgressHandler: (progressInfo: ProgressInfo) => void;
  private readonly boundErrorHandler: (error: Error) => void;
  private readonly boundDownloadedHandler: () => void;

  /**
   * Initializes the controller with window and service dependencies.
   * @param win - Target BrowserWindow instance to receive renderer events.
   * @param updateService - Service handling update domain logic.
   */
  constructor(
    private readonly win: BrowserWindow,
    private readonly updateService: UpdateService,
  ) {
    this.boundAvailableHandler = (available, newVersion) => {
      this.sendToRenderer("update-available", {
        update: available,
        version: app.getVersion(),
        newVersion,
      } as UpdateStatusPayload);
    };

    this.boundProgressHandler = (progressInfo) => {
      this.sendToRenderer("download-progress", progressInfo);
    };

    this.boundErrorHandler = (error) => {
      this.sendToRenderer("update-error", {
        message: error.message,
        error,
      } as UpdateErrorPayload);
    };

    this.boundDownloadedHandler = () => {
      this.sendToRenderer("update-downloaded");
    };
  }

  /**
   * Registers service event listeners and IPC handlers.
   */
  public init(): void {
    this.bindServiceEvents();
    this.bindIpcHandlers();
  }

  /**
   * Unregisters all service listeners and IPC handlers to prevent memory leaks.
   */
  public dispose(): void {
    this.unbindServiceEvents();
    this.unbindIpcHandlers();
  }

  /**
   * Binds domain update service events to corresponding IPC window notifications.
   */
  private bindServiceEvents(): void {
    this.updateService.on("available", this.boundAvailableHandler);
    this.updateService.on("download-progress", this.boundProgressHandler);
    this.updateService.on("error", this.boundErrorHandler);
    this.updateService.on("downloaded", this.boundDownloadedHandler);
  }

  /**
   * Removes service event listeners.
   */
  private unbindServiceEvents(): void {
    this.updateService.off("available", this.boundAvailableHandler);
    this.updateService.off("download-progress", this.boundProgressHandler);
    this.updateService.off("error", this.boundErrorHandler);
    this.updateService.off("downloaded", this.boundDownloadedHandler);
  }

  /**
   * Binds IPC invocation channels to service methods.
   */
  private bindIpcHandlers(): void {
    ipcMain.handle("check-update", async () => {
      return await this.updateService.checkForUpdates();
    });

    ipcMain.handle("start-download", async () => {
      return await this.updateService.startDownload();
    });

    ipcMain.handle("quit-and-install", () => {
      this.updateService.quitAndInstall();
    });
  }

  /**
   * Removes registered IPC channel handlers.
   */
  private unbindIpcHandlers(): void {
    ipcMain.removeHandler("check-update");
    ipcMain.removeHandler("start-download");
    ipcMain.removeHandler("quit-and-install");
  }

  /**
   * Safely dispatches IPC messages to renderer webContents if the window is active.
   * @param channel - IPC channel name.
   * @param args - Arguments to pass to the channel.
   */
  private sendToRenderer(channel: string, ...args: unknown[]): void {
    if (!this.win.isDestroyed()) {
      this.win.webContents.send(channel, ...args);
    }
  }
}
