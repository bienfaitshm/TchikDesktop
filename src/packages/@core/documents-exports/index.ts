/**
 * @file index.ts
 * @description Point d'entrée du module d'exportation de documents.
 * Connecte le DataSystem de l'application au moteur d'exportation Electron.
 */

import { DataExport } from "@/packages/electron-data-exporter";
import { registeredStrategies } from "./strategies";

/**
 * 2. Instance principale du service d'exportation.
 * @singleton documentExport
 * Ce service orchestre la validation, la récupération, la génération et la sauvegarde.
 */
export const documentExport = new DataExport(registeredStrategies);

/**
 * Exportation des types pour la consommation externe (ex: Frontend ou IPC Handlers)
 */
export type { AvailableStrategyId } from "./strategies";
export { DOCUMENT_EXPORT_ROUTES } from "./constants";
