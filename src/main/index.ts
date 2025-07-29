import { app, shell, BrowserWindow, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

// Configure le logger (optionnel)
autoUpdater.logger = log;

import icon from "../../resources/icon.png?asset";
import { server } from "@/camons/libs/electron-apis/server";
import "@/main/apps";
import { sequelize } from "./db/config";

const createMainWindow = (): void => {
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

  sequelize.sync({ alter: true }).then(() => {
    console.log("Database synchronized!");
    server.listen(mainWindow, (routes) => {
      console.log(`Server active, ${routes.length} routes initialized`);
    });
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
};

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron.tchik");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Événements de l'auto-updater
autoUpdater.on("checking-for-update", () => {
  log.info("Checking for update...");
});

autoUpdater.on("update-available", () => {
  log.info("Update available.");
  dialog.showMessageBox({
    type: "info",
    title: "Mise à jour disponible",
    message: "Une nouvelle version est disponible. Téléchargement en cours...",
    buttons: ["OK"],
  });
});

autoUpdater.on("update-not-available", () => {
  log.info("Update not available.");
});

autoUpdater.on("error", (err) => {
  log.error("Error in auto-updater: " + err);
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  log.info(log_message);
  // Vous pouvez envoyer la progression au renderer process pour afficher une barre de progression
  // mainWindow.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on("update-downloaded", () => {
  log.info("Update downloaded.");
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
        // Si l'utilisateur clique sur "Redémarrer"
        autoUpdater.quitAndInstall();
      }
    });
});
