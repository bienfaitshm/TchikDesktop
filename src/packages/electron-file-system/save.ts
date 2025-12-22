import { dialog, SaveDialogOptions } from "electron";
import { writeFile } from "fs/promises";
import { getLogger } from "@/packages/logger";

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
    options: FileSaveOptions = {}
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
    options: SaveDialogOptions
  ): Promise<string | null> {
    const { title = "Exporter le document", ...rest } = options;

    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title,
        ...rest,
      });

      if (canceled || !filePath) {
        logger.info("File save operation was cancelled by the user.");
        return null;
      }

      return filePath;
    } catch (error) {
      logger.error(
        "An error occurred while showing the save dialog",
        error as Error
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
    data: string | NodeJS.ArrayBufferView
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
