import { ElectronAPI } from "@electron-toolkit/preload";
import { TEndPoint } from "./apis";
declare global {
  interface Window {
    // Conserve le typage officiel pour tout ton code existant
    electron: ElectronAPI;

    // Ton point d'accès propre pour tes nouvelles routes/APIs (comme l'updater)
    api: TEndPoint;
  }
}

export {};
