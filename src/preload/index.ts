import { contextBridge, ipcRenderer } from "electron";
import { customIpcRenderer } from "./eletron-ipc";

const electronAPI = {
  // Référence directe à ipcRenderer (si besoin d'accès avancé)
  ipcRenderer: customIpcRenderer,

  /**
   * Récupère la version de l'application.
   * @returns {string} Version (ex: "1.2.3")
   */
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("get-app-version"),

  /**
   * Indique si l'application est en mode développement.
   * @returns {Promise<boolean>} true si mode dev
   */
  isModeDev: (): Promise<boolean> => ipcRenderer.invoke("is-mode-dev"),

  /**
   * Retourne un objet contenant toutes les métadonnées de l'application
   * (versions des composants, chemins, statut packagé…).
   * @returns {Promise<object>}
   */
  getAppInfo: (): Promise<any> => ipcRenderer.invoke("get-app-info"),

  shell: {
    /**
     * Ouvre une URL externe dans le navigateur par défaut.
     * @param {string} url - L'URL à ouvrir (http/https).
     * @returns {Promise<boolean>} true si l'URL a été ouverte, false sinon.
     */
    openExternal: (url: string): Promise<boolean> =>
      ipcRenderer.invoke("open-external-link", url),
  },

  /**
   * Récupère les caractéristiques du système d'exploitation et du matériel :
   * plateforme, architecture, mémoire, CPU, uptime…
   * @returns {Promise<object|null>}
   */
  getSystemInfo: (): Promise<any> => ipcRenderer.invoke("get-system-info"),

  /**
   * Fournit la charge système (moyennes de charge et usage CPU du processus principal).
   * @returns {Promise<object|null>}
   */
  getSystemLoad: (): Promise<any> => ipcRenderer.invoke("get-system-load"),

  /**
   * Liste tous les écrans connectés avec leurs propriétés (taille, échelle, rotation…).
   * @returns {Promise<Array<object>>}
   */
  getMonitors: (): Promise<any[]> => ipcRenderer.invoke("get-monitors"),

  /**
   * Retourne un ensemble de chemins standards (bureau, documents, userData…).
   * @returns {Promise<object|null>}
   */
  getAppPaths: (): Promise<any> => ipcRenderer.invoke("get-app-paths"),

  /**
   * Appelle la classe SystemInformation existante pour obtenir des données personnalisées.
   * Adaptez le type de retour selon votre implémentation.
   * @returns {Promise<any>}
   */
  getSystemInformationFeature: (): Promise<any> =>
    ipcRenderer.invoke("get-system-information-feature"),
};

export default electronAPI;
const customUpdaterAPI = {
  checkUpdate: () => ipcRenderer.invoke("check-update"),
  startDownload: () => ipcRenderer.invoke("start-download"),
  quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),

  onUpdateAvailable: (callback: (event: any, data: any) => void) => {
    ipcRenderer.on("update-can-available", callback);
    return () => ipcRenderer.removeListener("update-can-available", callback);
  },
  onDownloadProgress: (callback: (event: any, data: any) => void) => {
    ipcRenderer.on("download-progress", callback);
    return () => ipcRenderer.removeListener("download-progress", callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update-downloaded", callback);
    return () => ipcRenderer.removeListener("update-downloaded", callback);
  },
  onUpdateError: (callback: (event: any, error: any) => void) => {
    ipcRenderer.on("update-error", callback);
    return () => ipcRenderer.removeListener("update-error", callback);
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);

    contextBridge.exposeInMainWorld("api", {
      updater: customUpdaterAPI,
    });
  } catch (error) {
    console.error("Erreur d'exposition Preload :", error);
  }
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.api = { updater: customUpdaterAPI };
}
