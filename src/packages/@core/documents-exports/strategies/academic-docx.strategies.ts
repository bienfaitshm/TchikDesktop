/**
 * @file academic-docx.strategies.ts
 * @description Contient les implémentations concrètes des stratégies d'exportation
 * de documents académiques (Cotations, Inscriptions) au format DOCX.
 */

import { AbstractExportStrategy } from "./abstract-document-strategy";
import {
  ServiceOperationResult,
  ExportArtifact,
} from "@/main/services/documents-exports/document-export.service";
import { SaveFileOptions } from "@/main/libs/save-files";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";
import {
  generateDocxReport,
  resolveTemplatePath,
} from "@/main/libs/docx/config";
import { DOCUMENT_TAMPLATES } from "./constants";

import { DocumentExportSchema } from "./schemas";

// --- Types et Interfaces ---

/**
 * Type attendu pour les données passées aux stratégies DOCX.
 * Représente la structure des données de classes et d'inscriptions.
 */
type ClassroomExportData = {
  classrooms: Array<unknown>;
  school?: unknown;
};

// ==========================================
// 1. STRATÉGIE : Fiches de Cotations (Secondary Ratings)
// ==========================================

/**
 * Gère l'exportation des fiches de cotations secondaires au format DOCX.
 */
export class CotationDocxStrategy extends AbstractExportStrategy<
  unknown, // TParams (ValidationSchema)
  ClassroomExportData // TData
> {
  // --- Configuration ---
  public readonly strategyId = "COTATIONS_SECONDARY" as const;
  public readonly fileExtension = DOCUMENT_EXTENSION.DOCX;
  public readonly displayName = "Fiches de Cotations Secondaire";
  public readonly description =
    "Génère un rapport DOCX avec les fiches de cotations secondaires détaillées pour les classes spécifiées.";
  public readonly validationSchema = DocumentExportSchema;
  public readonly dataSourceDefinition = {
    classrooms: "classrooms.enrollments",
    school: "school.find.byId",
  };

  /**
   * Logique de génération DOCX.
   */
  public async generateArtifact(
    data: ClassroomExportData
  ): Promise<ServiceOperationResult<ExportArtifact>> {
    const templatePath = resolveTemplatePath(
      DOCUMENT_TAMPLATES.contationSecondary
    );

    try {
      // Génération du contenu DOCX.
      const generatedContent = await generateDocxReport(templatePath, {
        school: data.school, // Utilisation des données school/classrooms
        classrooms: data.classrooms,
      });

      const exportOptions: SaveFileOptions = {
        title: this.getDisplayName(),
        defaultPath: `Fiches-Cotations-Secondaire_${new Date().toISOString().slice(0, 10)}`,
        // Utilisation du helper hérité pour les filtres (implémenté dans l'abstract)
        filters: this.getElectronFileFilters(),
      };

      return {
        success: true,
        payload: {
          content: generatedContent,
          fileSystemOptions: exportOptions,
        },
      };
    } catch (error) {
      // Capture et gestion des erreurs spécifiques à la librairie DOCX
      return {
        success: false,
        error: {
          code: "DOCX_GENERATION_FAILED",
          message:
            "Échec de la génération du document Word (DOCX). Le template ou les données sont peut-être invalides.",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

// ==========================================
// 2. STRATÉGIE : Liste des Inscrits (Enrollment)
// ==========================================

/**
 * Gère l'exportation de la liste des élèves inscrits au format DOCX.
 */
export class EnrollementDocxStrategy extends AbstractExportStrategy<
  unknown, // TParams (ValidationSchema)
  ClassroomExportData // TData
> {
  // --- Configuration ---
  public readonly strategyId = "ENROLLMENT_DOCX" as const;
  public readonly fileExtension = DOCUMENT_EXTENSION.DOCX;
  public readonly displayName = "Rapport d'Inscriptions Élèves";
  public readonly description =
    "Exporte la liste détaillée des élèves inscrits (par classe, période, etc.) au format DOCX.";
  public readonly dataSourceDefinition = {
    classrooms: "classrooms.enrollments",
    school: "school.find.byId",
  };
  public readonly validationSchema = DocumentExportSchema;

  /**
   * Logique de génération DOCX pour la liste des inscrits.
   */
  public async generateArtifact(
    data: ClassroomExportData
  ): Promise<ServiceOperationResult<ExportArtifact>> {
    const templatePath = resolveTemplatePath(
      DOCUMENT_TAMPLATES.enrollementStudent
    );

    try {
      // Génération du contenu DOCX.
      const generatedContent = await generateDocxReport(templatePath, {
        school: data.school,
        classrooms: data.classrooms,
      });

      const exportOptions: SaveFileOptions = {
        title: this.getDisplayName(),
        defaultPath: `Liste-Inscrits_${this.generateDateSuffix()}`,
        filters: this.getElectronFileFilters(),
      };

      return {
        success: true,
        payload: {
          content: generatedContent,
          fileSystemOptions: exportOptions,
        },
      };
    } catch (error) {
      // Capture et gestion des erreurs spécifiques à la librairie DOCX
      return {
        success: false,
        error: {
          code: "DOCX_GENERATION_FAILED",
          message: "Échec de la génération du document Word (DOCX).",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}
