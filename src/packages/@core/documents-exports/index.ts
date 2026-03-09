/**
 * @file index.ts
 * @description Point d'entrée du module d'exportation de documents.
 * Connecte le DataSystem de l'application au moteur d'exportation Electron.
 */

import { dataBus } from "@/packages/@core/data-access/data-system-access";
import { DataExport } from "@/packages/electron-data-exporter";
import { DataSystemAdapter } from "./data-system-adapter";
import { registeredStrategies } from "./strategies";

/**
 * 1. Initialisation de l'Adaptateur.
 * Transforme le Bus de données global en une interface IDataFetchingService
 * compatible avec le moteur d'exportation.
 */
const dataSystemAdapter = new DataSystemAdapter(dataBus);

/**
 * 2. Instance principale du service d'exportation.
 * @singleton documentExport
 * Ce service orchestre la validation, la récupération, la génération et la sauvegarde.
 */
export const documentExport = new DataExport(
  registeredStrategies,
  dataSystemAdapter
);

/**
 * Exportation des types pour la consommation externe (ex: Frontend ou IPC Handlers)
 */
export type { AvailableStrategyId } from "./strategies";
export { DOCUMENT_EXPORT_ROUTES } from "./constants";
