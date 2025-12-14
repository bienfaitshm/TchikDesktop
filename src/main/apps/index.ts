import { ipcMain } from "electron";
import { IpcServer } from "@/packages/electron-ipc-rest";
import {
  instantiatedHandlers,
  EndpointRegistrar,
} from "@/packages/@core/apis/servers";

export const ipcServer = new IpcServer(ipcMain);

export const appEndpoints = new EndpointRegistrar(
  ipcServer,
  instantiatedHandlers
);
