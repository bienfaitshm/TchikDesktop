import { app, shell } from "electron";
import path from "node:path";
import fs from "node:fs";

/**
 * Garantit que le répertoire existe.
 * Utilise l'API asynchrone pour ne pas bloquer le thread principal.
 */
export const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Retourne un chemin absolu basé sur les ressources de l'application.
 * Utile pour accéder aux assets statiques ou fichiers inclus dans le build.
 */
export const getResourcePath = (subPath: string): string => {
  const rootDir = app.isPackaged ? process.resourcesPath : process.cwd();
  return path.join(rootDir, subPath);
};

/**
 * Retourne un chemin absolu dans le dossier de données de l'utilisateur.
 * @param subPath - Le chemin relatif ou le nom du fichier.
 * @param useDevFolder - Si vrai (par défaut), crée un dossier 'userdata-dev' en développement.
 */
export const getUserDataPath = (
  subPath: string,
  useDevFolder: boolean = true,
): string => {
  let baseDir: string;

  if (app.isPackaged) {
    baseDir = app.getPath("userData");
  } else {
    // En développement, on isole les données pour ne pas polluer la racine
    baseDir = useDevFolder
      ? path.join(process.cwd(), "userdata-dev")
      : process.cwd();
  }

  return path.join(baseDir, subPath);
};

export const openFile = async (filePath: string) => {
  try {
    if (!filePath) {
      return { success: false, error: "Le chemin du fichier est vide." };
    }
    const errorMessage = await shell.openPath(filePath);
    if (errorMessage) {
      console.error(
        `Erreur système lors de l'ouverture du fichier : ${errorMessage}`,
      );
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erreur critique lors de l'ouverture du chemin :", error);
    return { success: false, error: error?.message || "Erreur inconnue" };
  }
};
