import { ipcMain } from "electron";
import { IpcServer } from "@/packages/electron-ipc-rest";
import {
  instantiatedHandlers,
  EndpointRegistrar,
} from "@/packages/@core/apis/servers";
import { getLogger } from "@/packages/logger";

export const ipcServer = new IpcServer(ipcMain, {
  logger: getLogger("IPC Server"),
});

export const appEndpoints = new EndpointRegistrar(
  ipcServer,
  instantiatedHandlers
);
