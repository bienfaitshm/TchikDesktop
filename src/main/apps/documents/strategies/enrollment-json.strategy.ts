/**
 * @file enrollment-json.strategy.ts
 * @description Stratégie concrète pour l'exportation des données d'inscription au format JSON.
 * Gère la sérialisation des données brutes en un artefact binaire (Buffer).
 */

import { AbstractExportStrategy } from "./abstract-document-strategy";
import {
  ServiceOperationResult,
  ExportArtifact,
} from "@/main/apps/documents/document-export.service";
import { SaveFileOptions } from "@/main/libs/save-files";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";
import { ZodSchema } from "zod";
import {
  DocumentExportSchema,
  DocumentExportSchemaAttributes,
} from "./schemas";

type EnrollmentParams = DocumentExportSchemaAttributes;
/** Type attendu des données brutes récupérées pour l'inscription. */
type RawEnrollmentData = Array<Record<string, unknown>>;

/**
 * 📝 Implémentation de la stratégie d'exportation pour les listes d'inscrits en JSON.
 */
export class EnrollmentJsonStrategy extends AbstractExportStrategy<
  EnrollmentParams,
  RawEnrollmentData
> {
  // ==========================================
  // Configuration de la Stratégie (Implémentation des propriétés Abstraites)
  // ==========================================

  public readonly strategyId = "ENROLLMENT_JSON";
  public readonly fileExtension = DOCUMENT_EXTENSION.JSON;
  public readonly displayName = "Liste des Inscrits (JSON)";
  public readonly description =
    "Exporte les données d'inscription brutes sérialisées au format JSON, adaptées pour l'intégration système.";

  public readonly dataSourceDefinition = "classrooms.enrollments";
  public readonly validationSchema: ZodSchema<any> = DocumentExportSchema;

  // ==========================================
  // Logique d'exécution (Génération de l'Artefact)
  // ==========================================

  /**
   * 🏭 Transforme les données d'inscription brutes en un Buffer JSON.
   *
   * @param data - Les données d'inscription typées (RawEnrollmentData).
   * @returns Un artefact d'exportation contenant le Buffer JSON et les options de sauvegarde.
   */
  public async generateArtifact(
    data: RawEnrollmentData
  ): Promise<ServiceOperationResult<ExportArtifact>> {
    try {
      // --- 1. Génération du contenu binaire (Sérialisation) ---
      // Utilisation d'une indentation à 2 espaces pour la lisibilité (Bonne pratique de debug/audit)
      const jsonContent = JSON.stringify(data, null, 2);
      const generatedBuffer = Buffer.from(jsonContent, "utf-8");

      // --- 2. Définition des options d'exportation ---
      const exportOptions: SaveFileOptions = {
        title: this.getDisplayName(),
        defaultPath: `liste-inscrits_${this.generateDateSuffix()}.json`,
        // Utilisation du helper hérité pour maintenir la cohérence des filtres Electron
        filters: this.getElectronFileFilters(),
      };

      return {
        success: true,
        payload: {
          content: generatedBuffer,
          fileSystemOptions: exportOptions,
        },
      };
    } catch (error) {
      // Gestion des erreurs internes (ex: échec de la sérialisation si les données sont cycliques)
      return {
        success: false,
        error: {
          code: "ARTIFACT_GENERATION_FAILED",
          message: `Échec de la sérialisation JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      };
    }
  }
}
