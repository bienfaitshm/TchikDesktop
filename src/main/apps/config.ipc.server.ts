import { ipcMain } from "electron";
import { IpcServer } from "@/commons/libs/electron-ipc-rest";

export const ipcServer = new IpcServer(ipcMain);
