import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
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

  sequelize.sync().then((result) => {
    console.log("Database synchronized!", result);
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
