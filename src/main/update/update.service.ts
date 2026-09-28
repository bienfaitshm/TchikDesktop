import { app } from "electron";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import type {
  ProgressInfo,
  UpdateInfo,
  AppUpdater,
  UpdateCheckResult,
} from "electron-updater";
import { getLogger } from "@/packages/logger";

const { autoUpdater: defaultAutoUpdater } = createRequire(import.meta.url)(
  "electron-updater",
) as { autoUpdater: AppUpdater };
const defaultLogger = getLogger("Update");

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Service managing application auto-updates, progress tracking, and installation triggers.
 */
export class UpdateService extends EventEmitter {
  private readonly updater: AppUpdater;
  private readonly logger: Logger;

  /**
   * Initializes the update service and binds event listeners to the updater instance.
   * @param updater - Optional custom AppUpdater instance for dependency injection.
   * @param logger - Optional custom logger implementation.
   */
  constructor(
    updater: AppUpdater = defaultAutoUpdater,
    logger: Logger = defaultLogger,
  ) {
    super();
    this.updater = updater;
    this.logger = logger;
    this.configureUpdater();
    this.setupListeners();
  }

  /**
   * Applies baseline configuration flags to the updater instance.
   */
  private configureUpdater(): void {
    this.updater.autoDownload = false;
    this.updater.disableWebInstaller = false;
    this.updater.allowDowngrade = false;
  }

  /**
   * Binds updater lifecycle events to corresponding service emitters and logging calls.
   */
  private setupListeners(): void {
    this.updater.on("checking-for-update", () => {
      this.logger.info("Check update....");
    });

    this.updater.on("update-available", (info: UpdateInfo) => {
      this.emit("available", true, info.version);
    });

    this.updater.on("update-not-available", (info: UpdateInfo) => {
      this.emit("available", false, info.version);
    });

    this.updater.on("download-progress", (info: ProgressInfo) => {
      this.emit("download-progress", info);
    });

    this.updater.on("error", (error: Error) => {
      this.emit("error", error);
    });

    this.updater.on("update-downloaded", () => {
      this.emit("downloaded");
    });
  }

  /**
   * Checks for available updates on the remote server when running in a packaged environment.
   * @returns Promise resolving to the update check result or null if unavailable.
   * @throws Error if called outside a packaged application or when the update check fails.
   */
  async checkForUpdates(): Promise<UpdateCheckResult | null> {
    if (!app.isPackaged) {
      throw new Error("The update feature is only available after packaging.");
    }
    try {
      return await this.updater.checkForUpdatesAndNotify();
    } catch (error) {
      throw new Error("Failed to check for updates.", { cause: error });
    }
  }

  /**
   * Triggers the manual download of an available update package.
   * @returns Promise resolving to an array of downloaded file paths.
   */
  async startDownload(): Promise<string[]> {
    return await this.updater.downloadUpdate();
  }

  /**
   * Restarts the application and executes the installation of the downloaded update.
   */
  quitAndInstall(): void {
    this.updater.quitAndInstall(false, true);
  }
}
