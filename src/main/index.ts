import { app, shell, BrowserWindow, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { autoUpdater } from "electron-updater";
// Importation de electron-log pour les événements de l'updater, mais nous l'encapsulons
import log from "electron-log";

import icon from "../../resources/icon.png?asset";
import { sequelize } from "@/main/db/config";
import { getLogger } from "@/main/libs/logger";
import { performBackup } from "@/main/db/config";

import { appEndpoints, ipcServer } from "@/main/apps";

// Logger principal pour le process Electron
const mainLogger = getLogger("MainProcess");
const dbLogger = getLogger("Database");
const updaterLogger = getLogger("Updater");

// Configure electron-log (nécessaire pour autoUpdater)
autoUpdater.logger = log;
const ALTER_DB: boolean = false;

const createMainWindow = (): void => {
  mainLogger.info("Création de la fenêtre principale...");
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });
  mainLogger.info("Fenêtre principale créée avec les options par défaut.");

  // Synchronisation de la base de données
  dbLogger.info(
    `Tentative de synchronisation de la base de données (ALTER_DB: ${ALTER_DB}).`
  );
  sequelize
    .sync({ alter: ALTER_DB, logging: false })
    .then(() => {
      dbLogger.info("Base de données synchronisée avec succès.");

      // Démarrage du serveur API interne
      mainLogger.info("Démarrage du serveur API Electron...");
      appEndpoints.registerEndpoints();
      ipcServer.listen();
    })
    .catch((error) => {
      // Log professionnel en cas d'échec de la DB
      dbLogger.error(
        "Échec de la synchronisation de la base de données!",
        error
      );
      // Optionnel: Afficher une boîte de dialogue critique à l'utilisateur
      dialog.showErrorBox(
        "Erreur Critique de Démarrage",
        "La base de données n'a pas pu être initialisée. L'application pourrait ne pas fonctionner correctement."
      );
    });

  mainWindow.once("ready-to-show", () => {
    mainLogger.info("Fenêtre prête à être affichée.");
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainLogger.warn(`Tentative d'ouverture d'URL externe: ${url}`);
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Chargement de l'URL ou du fichier
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainLogger.info(
      `Chargement de l'URL de développement: ${process.env.ELECTRON_RENDERER_URL}`
    );
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    const filePath = join(__dirname, "../renderer/index.html");
    mainLogger.info(`Chargement du fichier de production: ${filePath}`);
    mainWindow.loadFile(filePath);
  }
};

app.whenReady().then(async () => {
  mainLogger.info("Application prête (whenReady).");

  electronApp.setAppUserModelId("com.electron.tchik");
  mainLogger.info("AppUserModelId défini.");

  await performBackup();

  app.on("browser-window-created", (_, window) => {
    mainLogger.info(
      "Nouvelle fenêtre de navigateur créée, optimisation des raccourcis."
    );
    optimizer.watchWindowShortcuts(window);
  });

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainLogger.info(
        'Événement "activate": Recréation de la fenêtre principale.'
      );
      createMainWindow();
    }
  });
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    mainLogger.info(
      'Événement "window-all-closed": Fermeture de l\'application.'
    );
    await performBackup();
    app.quit();
  }
});

// -----------------------------------------------------
// Événements de l'auto-updater (Utilise 'updaterLogger')
// -----------------------------------------------------

autoUpdater.on("checking-for-update", () => {
  updaterLogger.info("Vérification de mise à jour...");
});

autoUpdater.on("update-available", (info) => {
  updaterLogger.info("Mise à jour disponible.", { version: info.version });
  dialog.showMessageBox({
    type: "info",
    title: "Mise à jour disponible",
    message: "Une nouvelle version est disponible. Téléchargement en cours...",
    buttons: ["OK"],
  });
});

autoUpdater.on("update-not-available", () => {
  updaterLogger.info("Pas de mise à jour disponible.");
});

autoUpdater.on("error", (err) => {
  updaterLogger.error("Erreur dans l'auto-updater.", err);
});

autoUpdater.on("download-progress", (progressObj) => {
  // Utilisation de la structure de log pro pour les métadonnées
  updaterLogger.info("Progression du téléchargement.", {
    speed: progressObj.bytesPerSecond,
    percent: progressObj.percent.toFixed(2),
    transferred: progressObj.transferred,
    total: progressObj.total,
  });
  // Note: La communication vers le renderer doit se faire avec l'objet mainWindow (si accessible)
});

autoUpdater.on("update-downloaded", () => {
  updaterLogger.info("Mise à jour téléchargée. Prêt pour l'installation.");
  dialog
    .showMessageBox({
      type: "info",
      title: "Mise à jour prête à être installée",
      message:
        "La nouvelle version a été téléchargée. Redémarrez l'application pour l'installer.",
      buttons: ["Redémarrer", "Plus tard"],
    })
    .then((result) => {
      if (result.response === 0) {
        updaterLogger.info(
          "Commande de redémarrage et d'installation de la mise à jour."
        );
        autoUpdater.quitAndInstall();
      } else {
        updaterLogger.info("Installation différée par l'utilisateur.");
      }
    });
});
