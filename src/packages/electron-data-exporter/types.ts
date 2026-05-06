/**
 * @file types.ts
 * @description Contrats et types du sous-système d'export.
 */

import type { SaveDialogOptions, FileFilter } from "electron";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

/**
 * Union type pour la gestion des résultats (Pattern Result/Either).
 * @template T Le type de données retourné en cas de succès.
 */
export type ServiceResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: ServiceError; data?: never };

/**
 * Structure normalisée des erreurs applicatives.
 */
export interface ServiceError {
  readonly code:
    | "VALIDATION_ERROR"
    | "DATA_FETCH_ERROR"
    | "GENERATION_ERROR"
    | "IO_ERROR"
    | "NOT_FOUND"
    | "CANCELLED";
  readonly message: string;
  readonly details?: unknown;
}

/** Contenu binaire ou textuel après transformation. */
export type RawFileContent = string | Uint8Array | Buffer;

/**
 * Artefact d'export final.
 * Encapsule les données et les paramètres de dialogue Electron.
 */
export interface ExportArtifact {
  readonly content: RawFileContent;
  readonly saveOptions: Readonly<SaveDialogOptions>;
}

/**
 * Métadonnées d'un document pour l'interface utilisateur.
 */
export interface DocumentMetadata<TField = unknown> {
  readonly id: string;
  readonly extensions: FileFilter[];
  readonly title: string;
  readonly description: string;
  readonly fields?: TField[];
}

/**
 * Paramètres de contexte pour l'injection dans les requêtes de données.
 */
export interface ContextParams extends Record<string, unknown> {
  fileType?: DOCUMENT_EXTENSION;
}

/**
 * Contrat pour la récupération de données.
 * Utilise la généricité pour assurer la sécurité du typage en sortie.
 */
export interface IDataFetchingService {
  /**
   * Récupère des données typées via une clé de requête.
   * @throws Ne doit pas lever d'exception, mais retourner un ServiceResult.
   */
  fetch<T = unknown>(
    queryKey: string,
    params: ContextParams,
  ): Promise<ServiceResult<T>>;
}

/**
 * Contrat pour les générateurs de documents (PDF, Excel, etc.).
 * Suit le Strategy Pattern.
 */
export interface IDocumentGenerator {
  canHandle(extension: DOCUMENT_EXTENSION): boolean;
  generate(
    data: unknown,
    options: unknown,
  ): Promise<ServiceResult<ExportArtifact>>;
}

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
