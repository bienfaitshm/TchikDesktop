import { app, ipcMain, shell, screen } from "electron";
import { is } from "@electron-toolkit/utils";
import { getSystemInformation } from "@/main/features/apps-infos";
import * as os from "os";

/**
 * Récupère la version de l’application (celle définie dans le fichier package.json).
 */
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

/**
 * Ouvre une URL externe (http/https) dans le navigateur par défaut de l’OS.
 * @param url L'URL à ouvrir.
 * @returns true si l'URL est valide et a été ouverte, false sinon.
 */
ipcMain.handle("open-external-link", async (_, url: string) => {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de l’ouverture du lien :", error);
    return false;
  }
});

/**
 * Indique si l’application tourne en mode développement (true) ou en production (false).
 */
ipcMain.handle("is-mode-dev", () => {
  return is.dev;
});

/**
 * Retourne un ensemble de métadonnées concernant l’application Electron :
 * nom, version, versions des composants internes (Electron, Chrome, Node.js, V8),
 * statut packagé, et chemins principaux (exécutable, userData, logs…).
 */
ipcMain.handle("get-app-info", () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    v8Version: process.versions.v8,
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    exePath: app.getPath("exe"),
    userDataPath: app.getPath("userData"),
    logsPath: app.getPath("logs"),
    sessionDataPath: app.getPath("sessionData"),
  };
});

/**
 * Récupère les caractéristiques du système d’exploitation et du matériel :
 * plateforme, architecture, mémoire totale/libre/occupée, nombre de cœurs,
 * modèle CPU, répertoire utilisateur et uptime.
 */
ipcMain.handle("get-system-info", () => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      osVersion: os.version(),
      release: os.release(),
      totalMemory: totalMem,
      freeMemory: freeMem,
      usedMemory: totalMem - freeMem,
      cpuCount: cpus.length,
      cpuModel: cpus[0]?.model,
      homeDir: os.homedir(),
      uptime: os.uptime(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des infos système :", error);
    return null;
  }
});

/**
 * Donne les moyennes de charge sur 1, 5 et 15 minutes (sous Windows retourne 0)
 * ainsi que l’utilisation CPU instantanée du processus principal.
 */
ipcMain.handle("get-system-load", () => {
  try {
    const load = os.loadavg();
    return {
      load1: load[0],
      load5: load[1],
      load15: load[2],
      cpuUsage: process.getCPUUsage(),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la charge système :",
      error,
    );
    return null;
  }
});

/**
 * Fournit une liste des chemins système standards (bureau, documents, téléchargements…)
 * ainsi que les répertoires propres à l’application (appData, userData, temp).
 */
ipcMain.handle("get-app-paths", () => {
  try {
    return {
      home: app.getPath("home"),
      appData: app.getPath("appData"),
      userData: app.getPath("userData"),
      desktop: app.getPath("desktop"),
      documents: app.getPath("documents"),
      downloads: app.getPath("downloads"),
      music: app.getPath("music"),
      pictures: app.getPath("pictures"),
      videos: app.getPath("videos"),
      temp: app.getPath("temp"),
      exe: app.getPath("exe"),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des chemins :", error);
    return null;
  }
});

/**
 * Liste tous les écrans (moniteurs) connectés avec leurs propriétés :
 * identifiant, zone d’affichage, zone de travail, facteur d’échelle,
 * rotation et support tactile.
 */
ipcMain.handle("get-monitors", () => {
  try {
    const displays = screen.getAllDisplays();
    return displays.map((display) => ({
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      rotation: display.rotation,
      touchSupport: display.touchSupport,
      internal: display.internal,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des écrans :", error);
    return [];
  }
});

/**
 * Point d’accès vers les fonctionnalités de la classe SystemInformation.
 * Adaptez l’appel selon l’implémentation réelle (méthode statique, instance…).
 */
ipcMain.handle("get-system-information-feature", async () => {
  try {
    return getSystemInformation();
  } catch (error) {
    console.error("Erreur dans SystemInformation :", error);
    return null;
  }
});
