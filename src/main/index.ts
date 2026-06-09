import { app, shell, BrowserWindow } from "electron";
import path from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

import { dbManager } from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";

import { apiGateway, ipcServer } from "@/main/apps";
import { registerContextMenuListener } from "@/main/context-menus";
import { setupDevelopmentEnvironment } from "@/main/electron-dev-extension";
import { updateInit } from "@/main/update";
import { getAppIcon } from "@/main/utils";
import { handleFatalError } from "./error-handler";

const mainLogger = getLogger("MainProcess");

const createMainWindow = async (): Promise<BrowserWindow> => {
  mainLogger.info("Création de la fenêtre principale...");
  const appIcon = getAppIcon();

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 670,
    minHeight: 600,
    center: true,

    show: false,
    backgroundColor: "#ffffff",

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
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainLogger.info("Fenêtre principale créée avec les options par défaut.");

  registerContextMenuListener(mainWindow);

  mainWindow.once("ready-to-show", () => {
    mainLogger.info("Fenêtre prête à être affichée.");
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainLogger.warn(`Tentative d'ouverture d'URL externe: ${url}`);
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainLogger.info(
      `Chargement de l'URL de développement: ${process.env.ELECTRON_RENDERER_URL}`,
    );
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    const filePath = path.join(__dirname, "../renderer/index.html");
    mainLogger.info(`Chargement du fichier de production: ${filePath}`);
    mainWindow.loadFile(filePath);
  }

  return mainWindow;
};

app.whenReady().then(async () => {
  mainLogger.info("Application prête (whenReady).");

  electronApp.setAppUserModelId("com.electron.tchik");
  mainLogger.info("AppUserModelId défini.");

  mainLogger.info("Initialisation de la DATA...");
  // 1. Initialisation de la DATA en premier
  await dbManager.initialize();
  await dbManager.performBackup();

  mainLogger.info("Préparation des services...");
  // 2. Préparation des services
  apiGateway.registerEndpoints();
  ipcServer.listen();

  await dbManager.performBackup();
  await setupDevelopmentEnvironment({ logger: mainLogger });

  const mainWindow = await createMainWindow();

  updateInit(mainWindow);

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainLogger.info(
        'Événement "activate": Recréation de la fenêtre principale.',
      );
      const window = await createMainWindow();
      updateInit(window);
    }
  });

  app.on("browser-window-created", (_, window) => {
    mainLogger.info(
      "Nouvelle fenêtre de navigateur créée, optimisation des raccourcis.",
    );
    optimizer.watchWindowShortcuts(window);
  });
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    mainLogger.info(
      'Événement "window-all-closed": Fermeture de l\'application.',
    );
    await dbManager.performBackup();
    app.quit();
  }
});

process.on("unhandledRejection", (reason) => {
  handleFatalError("Unhandled Rejection", reason, mainLogger);
});

process.on("uncaughtException", (err) => {
  handleFatalError("Uncaught Exception", err, mainLogger);
});
