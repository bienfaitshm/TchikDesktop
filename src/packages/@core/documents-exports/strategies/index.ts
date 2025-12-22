/**
 * @file index.ts
 * @description Point d'entrée pour l'instanciation des stratégies d'exportation.
 * Centralise toutes les règles métier disponibles dans l'application.
 */

import { instantiateClasses } from "@/packages/handler-factory";
import { IExportStrategy } from "@/packages/electron-data-exporter";
import { EnrollmentExportStrategy } from "./enrollments";

/**
 * Liste des classes de stratégies à instancier.
 * Ajouter une nouvelle stratégie ici la rend automatiquement disponible
 * dans tout le système d'export.
 */
const STRATEGY_CLASSES = [
  EnrollmentExportStrategy,
  // AttendanceExportStrategy,
  // FinanceExportStrategy,
  // Ajoutez les futures stratégies ici :
];

/**
 * Instances prêtes à l'emploi des stratégies d'exportation.
 * Utilise la factory pour garantir que les constructeurs sont appelés correctement.
 */
export const registeredStrategies: IExportStrategy[] =
  instantiateClasses(STRATEGY_CLASSES);

/**
 * Aide au typage : Exportation des IDs de stratégies disponibles pour l'autocomplétion.
 */
export type AvailableStrategyId =
  (typeof STRATEGY_CLASSES)[number]["prototype"]["id"];
