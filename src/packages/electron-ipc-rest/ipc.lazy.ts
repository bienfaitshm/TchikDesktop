/**
 * @file ipc.lazy.ts
 */

import { IpcClient, IpcServer } from "./ipc";
import type { IpcRenderer } from "@electron-toolkit/preload";

export function createLazyIpcClient(ipcRenderer: IpcRenderer): IpcClient {
  let instance: IpcClient | null = null;

  const getInstance = () => {
    if (!instance) {
      console.log("[LazyIPC] Initializing IpcClient core...");
      instance = new IpcClient(ipcRenderer);
    }
    return instance;
  };

  return new Proxy({} as IpcClient, {
    get(_, prop: string) {
      const target = getInstance();
      const value = Reflect.get(target, prop);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export function createLazyIpcServer(ipcMain: Electron.IpcMain): IpcServer {
  let instance: IpcServer | null = null;

  return new Proxy({} as IpcServer, {
    get(_, prop: string) {
      if (!instance) {
        instance = new IpcServer(ipcMain);
      }
      return Reflect.get(instance, prop);
    },
  });
}
