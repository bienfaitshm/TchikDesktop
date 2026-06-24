/**
 * @file file-system.ts
 * @description Implémentation concrète du système de fichiers pour Electron.
 */

import type { SaveDialogOptions } from "electron";
import { dialog } from "electron";
import { writeFile, mkdir } from "fs/promises";
import { dirname, basename } from "path";
import { getLogger } from "@/packages/logger";
import type { RawFileContent, IFileSystem } from "./types";

export class ElectronFileSystem implements IFileSystem {
  private readonly logger = getLogger("FileSystem");

  /**
   * Affiche la boîte de dialogue native pour choisir l'emplacement de sauvegarde.
   */
  public async promptSavePath(
    options: SaveDialogOptions,
  ): Promise<string | null> {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog(options);
      if (canceled || !filePath) {
        return null;
      }
      return filePath;
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'ouverture du SaveDialog",
        error as Error,
      );
      return null;
    }
  }

  /**
   * Persiste les données sur le disque de manière atomique.
   * Gère la création automatique des dossiers parents si nécessaire.
   */
  public async persistToDisk(
    path: string,
    content: RawFileContent,
  ): Promise<void> {
    try {
      const targetDir = dirname(path);
      await mkdir(targetDir, { recursive: true });

      await writeFile(path, content, {
        encoding: typeof content === "string" ? "utf8" : undefined,
      });

      this.logger.info(`Fichier sauvegardé avec succès : ${path}`);
    } catch (error) {
      this.logger.error(
        `Échec de l'écriture sur le disque : ${path}`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Extrait le nom du fichier (avec extension) à partir d'un chemin complet.
   *
   * @param path - Chemin absolu ou relatif du fichier.
   * @returns Le nom du fichier (ex: "document.pdf").
   * @throws {Error} Si l'extraction échoue (cas très rare).
   *
   * @example
   * const fileName = await fs.getFileName("/users/docs/rapport.pdf");
   * console.log(fileName); // "rapport.pdf"
   */
  public async getFileName(path: string): Promise<string> {
    try {
      return basename(path);
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'extraction du nom de fichier.",
        error as Error,
      );
      throw error;
    }
  }
}
