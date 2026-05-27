import type { BrowserWindow } from "electron";
import { UpdateService } from "./update.service";
import { UpdateController } from "./update.controller";

export function updateInit(win: BrowserWindow) {
  const updateService = new UpdateService();
  const updateController = new UpdateController(win, updateService);

  updateController.init();
}
