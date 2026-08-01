import { app, shell, BrowserWindow } from "electron";
import debug from "electron-debug";
import path from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { dbManager } from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";
import { ipcServer } from "@/main/apps";
import { initializeTextModifiers } from "@/main/features/text-transformation";
import { setupDevelopmentEnvironment } from "@/main/electron-dev-extension";
import { updateInit } from "@/main/update";
import { getAppIcon } from "@/main/utils";
import { handleFatalError } from "./error-handler";
import {
  registerStoreIpcHandlers,
  tchikAppStore,
} from "@/packages/@core/data-access/stores";

import "@/main/apps/system-infos";

debug();

const mainLogger = getLogger("MainProcess");
let isDatabaseReady = false;

/**
 * Creates and loads the primary application window.
 * @returns A promise that resolves to the instantiated BrowserWindow.
 */
const createMainWindow = async (): Promise<BrowserWindow> => {
  mainLogger.info("Creating primary application window...");
  const appIcon = getAppIcon();

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 870,
    minHeight: 800,
    center: true,
    backgroundColor: tchikAppStore.getBackgroundWindow(),
    show: false,
    title: "Tchik",
    icon: appIcon,
    autoHideMenuBar: true,
    titleBarStyle: "default",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
      backgroundThrottling: true,
      devTools: is.dev,
    },
  });

  if (is.dev) {
    mainWindow.webContents.openDevTools({ mode: "right" });
  }

  mainWindow.once("ready-to-show", () => {
    mainLogger.info("Main window ready to show.");
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainLogger.warn(`External URL navigation attempt: ${url}`);
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainLogger.info(
      `Loading development URL: ${process.env.ELECTRON_RENDERER_URL}`,
    );
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    const filePath = path.join(__dirname, "../renderer/index.html");
    mainLogger.info(`Loading production index file: ${filePath}`);
    await mainWindow.loadFile(filePath);
  }

  return mainWindow;
};

/**
 * Bootstraps backend services including database and IPC listeners.
 * @returns A promise resolving when all services are initialized.
 */
const initializeAppServices = async (): Promise<void> => {
  try {
    mainLogger.info("Initializing background data services...");
    await dbManager.performBackup();
    await dbManager.initialize();

    isDatabaseReady = true;
    mainLogger.info("Database initialized successfully.");

    mainLogger.info("Starting IPC servers and registering store handlers...");
    ipcServer.listen();
    registerStoreIpcHandlers(tchikAppStore);
  } catch (error) {
    mainLogger.error("Fatal error during database initialization:", error);
    handleFatalError("Database Initialization Error", error, mainLogger);
  }
};

/**
 * Creates a window and attaches necessary features and state listeners.
 * @returns A promise resolving to the fully configured BrowserWindow.
 */
const setupAppWindow = async (): Promise<BrowserWindow> => {
  const window = await createMainWindow();

  tchikAppStore.setWindow(window);
  initializeTextModifiers(window);
  updateInit(window);

  if (isDatabaseReady) {
    window.webContents.send("database-ready");
  }

  return window;
};

/**
 * Binds global application events and orchestrates the startup sequence.
 */
const bootstrapApp = (): void => {
  app.whenReady().then(async () => {
    mainLogger.info("Application ready event triggered.");
    electronApp.setAppUserModelId("com.electron.tchik");

    const mainWindow = await setupAppWindow();

    await initializeAppServices();
    // Notify the initial window since DB was initialized after window creation
    mainWindow.webContents.send("database-ready");

    setupDevelopmentEnvironment({ logger: mainLogger }).catch((err) => {
      mainLogger.error("Failed to setup development environment:", err);
    });

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainLogger.info("Activate event: Re-creating main application window.");
        await setupAppWindow();
      }
    });

    app.on("browser-window-created", (_, window) => {
      mainLogger.info("New window created, applying shortcut optimization.");
      optimizer.watchWindowShortcuts(window);
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      mainLogger.info("All windows closed: Exiting application.");
      app.quit();
    }
  });
};

/**
 * Sets up listeners for unhandled exceptions to prevent silent process crashes.
 */
const registerGlobalProcessErrorHandler = (): void => {
  process.on("unhandledRejection", (reason) => {
    handleFatalError("Unhandled Rejection", reason, mainLogger);
  });

  process.on("uncaughtException", (err) => {
    handleFatalError("Uncaught Exception", err, mainLogger);
  });
};

registerGlobalProcessErrorHandler();
bootstrapApp();
