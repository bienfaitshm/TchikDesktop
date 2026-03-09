/**
 * @file types.ts
 * @description Définitions centralisées des types pour le sous-système d'export.
 */
import { SaveDialogOptions } from "electron";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";

// --- Result Pattern (Monad-like) ---
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

export interface ServiceError {
  code:
    | "VALIDATION_ERROR"
    | "DATA_FETCH_ERROR"
    | "GENERATION_ERROR"
    | "IO_ERROR"
    | "NOT_FOUND"
    | "CANCELLED";
  message: string;
  details?: unknown;
}

// --- Domain Types ---

/** Définition des sources de données : soit une clé unique, soit un map de clés. */
export type DataSourceQueryDefinition = string | Record<string, string>;

/** Résultat brut d'une transformation de fichier. */
export type RawFileContent = string | NodeJS.ArrayBufferView;

/** L'artefact final prêt à être sauvegardé. */
export interface ExportArtifact {
  /** Le contenu binaire ou textuel du fichier. */
  content: RawFileContent;
  /** Métadonnées pour la boîte de dialogue de sauvegarde. */
  saveOptions: SaveDialogOptions;
}

/** Métadonnées pour l'UI (Menu de choix). */
export interface DocumentMetadata {
  key: string;
  extensions: Electron.FileFilter[];
  title: string;
  description: string;
}

// --- External Services Contracts ---

export interface IDataFetchingService {
  /** Récupère les données depuis la couche d'accès aux données. */
  fetch(
    queryKey: string,
    contextParams: unknown
  ): Promise<ServiceResult<unknown>>;
}
