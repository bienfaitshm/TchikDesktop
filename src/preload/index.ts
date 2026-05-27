import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
  ipcRenderer: {
    send(channel: string, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    sendSync(channel: string, ...args: any[]) {
      return ipcRenderer.sendSync(channel, ...args);
    },
    invoke(channel: string, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    on(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    },
    once(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.once(channel, listener);
    },
    removeListener(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
};

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
