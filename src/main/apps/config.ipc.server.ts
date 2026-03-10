import { ipcMain } from "electron";
import { createLazyIpcServer } from "@/packages/electron-ipc-rest";

import { getLogger } from "@/packages/logger";

export const ipcServer = createLazyIpcServer(ipcMain, {
  logger: getLogger("IPC Server"),
});
