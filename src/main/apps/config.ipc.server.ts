import { ipcMain } from "electron";
import { IpcServer } from "@/packages/electron-ipc-rest";

import { getLogger } from "@/packages/logger";

export const ipcServer = new IpcServer(ipcMain, {
  logger: getLogger("IPC Server"),
});
