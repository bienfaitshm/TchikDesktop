import { dialog, SaveDialogOptions } from "electron";
import { writeFile } from "fs/promises";
import { getLogger } from "@/packages/logger";
import * as path from "path";

const logger = getLogger("FileSystem");

/**
 * Options étendues pour la sauvegarde de fichiers, héritant de celles d'Electron.
 */
export interface FileSaveOptions extends SaveDialogOptions {
  /** Message optionnel affiché dans le logger avant l'écriture. */
  logMessage?: string;
}

/**
 * Service utilitaire pour la gestion des interactions avec le système de fichiers.
 */
export class FileSystem {
  /**
   * Orchestre l'ouverture d'une boîte de dialogue et l'écriture immédiate des données.
   * C'est la méthode recommandée pour les exports simples.
   * * @param data - Contenu du fichier (String ou Buffer).
   * @param options - Configuration de la boîte de dialogue.
   * @returns Le chemin final du fichier ou null si l'action est annulée.
   */
  static async saveDataWithDialog(
    data: string | NodeJS.ArrayBufferView,
    options: FileSaveOptions = {},
  ): Promise<string | null> {
    try {
      const filePath = await this.promptSavePath(options);

      if (!filePath) return null;

      await this.persistToDisk(filePath, data);
      return filePath;
    } catch (error) {
      logger.error("Failed to execute save workflow", error as Error);
      return null;
    }
  }

  /**
   * Affiche uniquement la boîte de dialogue pour obtenir un chemin d'enregistrement.
   * * @param options - Options de configuration Electron.
   * @returns Le chemin sélectionné par l'utilisateur ou null.
   */
  static async promptSavePath(
    options: SaveDialogOptions,
  ): Promise<string | null> {
    // 1. Extraction et préparation de l'extension par défaut
    const {
      title = "Exporter le document",
      filters,
      defaultPath,
      ...rest
    } = options;

    // On détermine l'extension de secours (ex: 'pdf')
    const fallbackExt =
      filters && filters.length > 0 ? filters[0].extensions[0] : "";

    let adjustedDefaultPath = defaultPath;

    // Astuce Linux : Si le defaultPath n'a pas d'extension, on lui en ajoute une
    // pour forcer le sélecteur de fichier à se positionner correctement.
    if (
      adjustedDefaultPath &&
      fallbackExt &&
      !path.extname(adjustedDefaultPath)
    ) {
      adjustedDefaultPath = `${adjustedDefaultPath}.${fallbackExt}`;
    }

    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title,
        filters,
        defaultPath: adjustedDefaultPath,
        ...rest,
      });

      if (canceled || !filePath) {
        return null;
      }

      const currentExt = path.extname(filePath);

      if (!currentExt && fallbackExt) {
        return `${filePath}.${fallbackExt}`;
      }

      return filePath;
    } catch (error) {
      logger.error(
        "An error occurred while showing the save dialog",
        error as Error,
      );
      return null;
    }
  }

  /**
   * Écrit physiquement les données sur le disque.
   * * @param path - Chemin absolu du fichier.
   * @param data - Contenu à enregistrer.
   * @throws Relance l'erreur pour une gestion par l'appelant.
   */
  static async persistToDisk(
    path: string,
    data: string | NodeJS.ArrayBufferView,
  ): Promise<void> {
    try {
      logger.info(`Persisting file to: ${path}...`);
      await writeFile(path, data);
      logger.info("File successfully persisted to disk.");
    } catch (error) {
      logger.error(`Critical I/O error at ${path}`, error as Error);
      throw error; // Important pour la propagation dans les workflows complexes
    }
  }
}
