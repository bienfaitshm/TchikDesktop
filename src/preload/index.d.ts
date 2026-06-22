import { ElectronAPI } from "@electron-toolkit/preload";
import { TEndPoint } from "./apis";

declare global {
  interface Window {
    electron: ElectronAPI & {
      shell: {
        openExternal: (url: string) => Promise<boolean>;
      };
      getAppVersion: () => Promise<string>;
    };

    // Ton point d'accès propre pour tes nouvelles routes/APIs (comme l'updater)
    api: TEndPoint;
  }
}

export {};
