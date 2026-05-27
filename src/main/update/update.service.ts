import { app } from "electron";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import type { ProgressInfo, UpdateInfo } from "electron-updater";
import { getLogger } from "@/packages/logger";

const { autoUpdater } = createRequire(import.meta.url)("electron-updater");
const updaterLogger = getLogger("Update");

export class UpdateService extends EventEmitter {
  constructor() {
    super();
    this.configureUpdater();
    this.setupListeners();
  }

  private configureUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.disableWebInstaller = false;
    autoUpdater.allowDowngrade = false;
  }

  private setupListeners() {
    autoUpdater.on("checking-for-update", () => {
      updaterLogger.info("Check update....");
    });

    autoUpdater.on("update-available", (info: UpdateInfo) => {
      this.emit("available", true, info.version);
    });

    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      this.emit("available", false, info.version);
    });

    autoUpdater.on("download-progress", (info: ProgressInfo) => {
      this.emit("download-progress", info);
    });

    autoUpdater.on("error", (error: Error) => {
      this.emit("error", error);
    });

    autoUpdater.on("update-downloaded", () => {
      this.emit("downloaded");
    });
  }

  async checkForUpdates() {
    if (!app.isPackaged) {
      throw new Error("The update feature is only available after packaging.");
    }
    try {
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      throw new Error("Network error", { cause: error });
    }
  }

  async startDownload() {
    return await autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall(false, true);
  }
}
