import { ElectronAPI } from "@electron-toolkit/preload"
import { TEndPoint } from "./apis"
declare global {
  interface Window {
    electron: ElectronAPI
    api: TEndPoint
  }
}
