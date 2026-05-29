import { app, shell, BrowserWindow, nativeImage } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

import { dbManager } from "@/packages/@core/data-access/db";
import { getLogger } from "@/packages/logger";

import { apiGateway, ipcServer } from "@/main/apps";
import { registerContextMenuListener } from "@/main/context-menus";
import { setupDevelopmentEnvironment } from "@/main/electron-dev-extension";
import { updateInit } from "@/main/update";
import { getAppIcon } from "@/main/utils";

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
      preload: join(__dirname, "../preload/index.js"),

      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,

      spellcheck: true,
      backgroundThrottling: true,
      devTools: is.dev,
    },
  });

  mainLogger.info("Fenêtre principale créée avec les options par défaut.");

  await dbManager.initialize();
  mainLogger.info("Démarrage du serveur API Electron...");
  apiGateway.registerEndpoints();
  ipcServer.listen();

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
    const filePath = join(__dirname, "../renderer/index.html");
    mainLogger.info(`Chargement du fichier de production: ${filePath}`);
    mainWindow.loadFile(filePath);
  }

  return mainWindow;
};

app.whenReady().then(async () => {
  mainLogger.info("Application prête (whenReady).");

  electronApp.setAppUserModelId("com.electron.tchik");
  mainLogger.info("AppUserModelId défini.");

  await dbManager.performBackup();
  await setupDevelopmentEnvironment({ logger: mainLogger });

  app.on("browser-window-created", (_, window) => {
    mainLogger.info(
      "Nouvelle fenêtre de navigateur créée, optimisation des raccourcis.",
    );
    optimizer.watchWindowShortcuts(window);
  });

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
