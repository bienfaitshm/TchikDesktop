import { ipcMain } from "electron";
import { IpcServer } from "@/packages/electron-ipc-rest";
import { getLogger } from "@/packages/logger";

import "@/packages/@core/apis/servers/handlers";

export const ipcServer = new IpcServer(ipcMain, {
  logger: getLogger("IPC Server"),
});
