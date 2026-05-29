import { app, nativeImage } from "electron";
import { join } from "path";

/**
 * Retourne le chemin absolu de l'icône de l'application.
 * Gère dynamiquement la différence de structure entre l'environnement
 * de développement et l'application packagée (Production).
 * * @returns {string} Le chemin absolu vers le fichier icon.png
 */
export const getAppIconPath = (): string => {
  return app.isPackaged
    ? join(process.resourcesPath, "resources", "icon.png") // En Production (Chemin stable hors ASAR)
    : join(app.getAppPath(), "resources", "icon.png"); // En Développement (Racine du projet)
};

export const getAppIcon = (): Electron.NativeImage => {
  const iconPath = getAppIconPath();
  return nativeImage.createFromPath(iconPath);
};
