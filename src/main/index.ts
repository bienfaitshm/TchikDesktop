import { app, shell, BrowserWindow, nativeTheme } from "electron";
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
import "@/main/apps/system-infos";

const mainLogger = getLogger("MainProcess");
const isDark = nativeTheme.shouldUseDarkColors;

const createMainWindow = async (): Promise<BrowserWindow> => {
  mainLogger.info("Création de la fenêtre principale...");
  const appIcon = getAppIcon();

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 870,
    minHeight: 800,
    center: true,
    backgroundColor: isDark ? "#181c1e" : "#ffffff",
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

  mainLogger.info("Fenêtre principale créée avec les options par défaut.");

  initializeTextModifiers(mainWindow);

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

  const mainWindow = await createMainWindow();
  updateInit(mainWindow);

  (async () => {
    try {
      mainLogger.info("Initialisation de la DATA en arrière-plan...");

      await dbManager.performBackup();
      await dbManager.initialize();
      mainLogger.info("DATA initialisée avec succès.");

      mainLogger.info("Préparation et enregistrement des services...");
      ipcServer.listen();

      mainWindow.webContents.send("database-ready");
    } catch (error) {
      mainLogger.error(
        "Erreur critique lors de l'initialisation de la base de données :",
        error,
      );
      handleFatalError("Database Initialization Error", error, mainLogger);
    }
  })();

  setupDevelopmentEnvironment({ logger: mainLogger }).catch((err) => {
    mainLogger.error(
      "Erreur lors de la configuration de l'environnement de dev :",
      err,
    );
  });

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
    app.quit();
  }
});

process.on("unhandledRejection", (reason) => {
  handleFatalError("Unhandled Rejection", reason, mainLogger);
});

process.on("uncaughtException", (err) => {
  handleFatalError("Uncaught Exception", err, mainLogger);
});
