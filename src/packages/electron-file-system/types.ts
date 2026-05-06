/**
 * @file types.ts
 * @description Contrats et types du sous-système d'export.
 */

import type { SaveDialogOptions } from "electron";

/** Contenu binaire ou textuel après transformation. */
export type RawFileContent = string | Uint8Array | Buffer;

/**
 * Abstraction du système de fichiers pour garantir la testabilité.
 */
export interface IFileSystem {
  /**
   * Ouvre la boîte de dialogue système pour demander un chemin de sauvegarde.
   * @param options Configuration de la fenêtre de dialogue Electron.
   * @returns Le chemin complet choisi par l'utilisateur ou null s'il annule.
   */
  promptSavePath(options: SaveDialogOptions): Promise<string | null>;

  /**
   * Écrit les données de manière asynchrone sur le support de stockage.
   * @param path Chemin absolu vers le fichier.
   * @param content Contenu binaire ou texte à persister.
   */
  persistToDisk(path: string, content: RawFileContent): Promise<void>;
}
