/**
 * @file index.ts
 * @description Point d'entrée du module d'exportation de documents.
 * Initialise l'orchestrateur avec ses dépendances injectées.
 */

import { DataExport } from "@/packages/electron-data-exporter";
import { ElectronFileSystem } from "@/packages/electron-file-system";
import { openFile } from "@/packages/electron-utility";
import { registeredStrategies } from "./strategies";

/**
 * 1. Initialisation des adaptateurs d'infrastructure.
 * L'utilisation d'une interface IFileSystem permet de switcher vers
 * un autre adaptateur (ex: Cloud ou Mock) sans modifier le moteur d'export.
 */
const fileSystem = new ElectronFileSystem();

/**
 * 2. Instance principale du service d'exportation (Singleton).
 * Ce service orchestre le workflow : Validation -> Choix chemin -> Fetch -> Build -> Write.
 */
export const documentExport = new DataExport(registeredStrategies, fileSystem, {
  onOpenFile: openFile,
});

/**
 * 3. Exportation des types et constantes pour la consommation externe.
 * Pratique pour le typage des Handlers IPC ou du Bridge Preload.
 */
export { DOCUMENT_EXPORT_ROUTES } from "./constants";
