import { app } from "electron";
import path from "path";

export function getExtraPath(dirName: string) {
  const basePath = app.isPackaged ? process.resourcesPath : process.cwd();

  return path.join(basePath, dirName);
}
