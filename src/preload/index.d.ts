import { ElectronAPI } from "@electron-toolkit/preload";
import { TEndPoint } from "./apis";

interface AppInfo {
  name: string;
  version: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
  isPackaged: boolean;
  appPath: string;
  exePath: string;
  userDataPath: string;
  logsPath: string;
  sessionDataPath: string;
}

interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  osVersion: string;
  release: string;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  cpuCount: number;
  cpuModel: string | undefined;
  homeDir: string;
  uptime: number;
}

interface SystemLoad {
  load1: number;
  load5: number;
  load15: number;
  cpuUsage: Electron.CPUUsage;
}

interface Monitor {
  id: number;
  bounds: Electron.Rectangle;
  workArea: Electron.Rectangle;
  scaleFactor: number;
  rotation: number;
  touchSupport: "available" | "unavailable" | "unknown";
  internal: boolean;
}

interface AppPaths {
  home: string;
  appData: string;
  userData: string;
  desktop: string;
  documents: string;
  downloads: string;
  music: string;
  pictures: string;
  videos: string;
  temp: string;
  exe: string;
}

export interface SystemInformation {
  platform: NodeJS.Platform;
  type: string;
  arch: string;
  release: string;
  uptime: number;
  hostname: string;
  totalmem: number;
  freemem: number;
  cpus: os.CpuInfo[];
  networkInterfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
  homedir: string;
  macAddresses: NetworkInterfaceMacInfo[];
}

declare global {
  interface Window {
    electron: ElectronAPI & {
      getBackupDbFiles: () => Promise<{ name: string; time: number }[]>;
      getAppVersion: () => Promise<string>;
      shell: {
        openExternal: (url: string) => Promise<boolean>;
      };

      isModeDev: () => Promise<boolean>;
      getAppInfo: () => Promise<AppInfo>;
      getSystemInfo: () => Promise<SystemInfo | null>;
      getSystemLoad: () => Promise<SystemLoad | null>;
      getMonitors: () => Promise<Monitor[]>;
      getAppPaths: () => Promise<AppPaths | null>;
      getSystemInformationFeature: () => Promise<SystemInformation>;
    };

    api: TEndPoint;
  }
}

export {};
