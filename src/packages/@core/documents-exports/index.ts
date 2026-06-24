/**
 * @file index.ts
 * @description Point d'entrée du module d'exportation de documents.
 * Initialise l'orchestrateur avec ses dépendances injectées.
 */

import { DataExport } from "@/packages/electron-data-exporter";
import { ElectronFileSystem } from "@/packages/electron-file-system";
import { openFile, notify } from "@/packages/electron-utility";
import { exportHistoryRepository } from "@/packages/@core/data-access/db/queries";
import { mainLogger } from "@/packages/logger";
import { registeredStrategies } from "./strategies";

const fileSystem = new ElectronFileSystem();

export const documentExport = new DataExport(registeredStrategies, fileSystem, {
  onOpenFile: openFile,

  /**
   * Callback de notification après export.
   * Affiche une notification système native avec titre et corps adaptés au résultat.
   */
  notifyOnExport: ({ success, data }) => {
    try {
      const title = success ? "Exportation réussie" : "Échec de l'exportation";
      const body =
        typeof data === "string"
          ? data
          : data?.message || "Une erreur est survenue";
      notify({ title, body });
    } catch (error) {
      mainLogger.error(
        "Impossible d'afficher la notification d'export.",
        error,
      );
    }
  },

  /**
   * Sauvegarde l'export dans l'historique (base de données).
   * Ignore silencieusement les erreurs pour ne pas perturber l'expérience utilisateur.
   */
  saveHistoryExport: async ({
    exportKey,
    exportName,
    fileType,
    filePath,
    schoolId,
    userId,
  }) => {
    if (!schoolId) return;
    try {
      await exportHistoryRepository.create({
        exportKey,
        exportName,
        fileType,
        schoolId,
        filePath,
        userId,
      });
    } catch (error) {
      mainLogger.error(
        "Erreur lors de la sauvegarde de l'historique d'export.",
        error,
      );
    }
  },
});

export { DOCUMENT_EXPORT_ROUTES } from "./constants";
