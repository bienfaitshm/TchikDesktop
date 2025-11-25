/**
 * MODULE: Gestionnaires d'Exportation de Documents
 * * Ce module contient les implémentations concrètes des gestionnaires de documents
 * pour l'exportation de données académiques (cotations, inscriptions) au format DOCX.
 * Chaque classe étend l'AbstractDocumentHandler pour définir les métadonnées
 * du document et la logique de génération du contenu.
 */

import { DocumentExportSchema } from "./schema";
import { AbstractDocumentHandler, ProcessHandleResult } from "./report";
import { SaveFileOptions } from "@/main/libs/save-files";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";
import {
  generateDocxReport,
  resolveTemplatePath,
} from "@/main/libs/docx/config";
import { DOCUMENT_TAMPLATES } from "./constants";

/**
 * Type attendu pour les données passées aux gestionnaires (typiquement des listes de classes).
 */
type ClassroomExportData = unknown; // Remplacer 'unknown' par le type réel de la structure de données des classes si disponible

/**
 * Gère l'exportation des fiches de cotations secondaires.
 * * Cette classe définit les métadonnées pour l'interface utilisateur (clé, titre, description)
 * et implémente la logique pour générer un document DOCX à partir du template
 * des cotations secondaires, en utilisant les données de classes fournies.
 */
export class CotationDocumentHandler extends AbstractDocumentHandler {
  /** Clé d'identification unique pour ce gestionnaire. Utilisée dans l'API. */
  public readonly key = "COTATIONS_SECONDARY" as const;

  /** Type de fichier d'exportation (ex: .docx). */
  public readonly type = DOCUMENT_EXTENSION.DOCX;

  /** Titre affiché à l'utilisateur lors de l'exportation. */
  public readonly title = "Fiches de cotations secondaire";

  /** Description détaillée de la fonctionnalité pour l'interface utilisateur. */
  public readonly description =
    "Génère des fiches de cotations secondaires détaillées pour les classes spécifiées.";

  /** Nom de la requête ou de l'endpoint utilisé pour récupérer les données. */
  public readonly requestName = "classrooms.enrollments";

  /** Schéma de validation pour les options d'exportation. */
  public readonly schema = DocumentExportSchema;

  /**
   * Logique principale de traitement des données et de génération de document.
   * @param data Les données d'exportation, typiquement une liste d'inscriptions/classes.
   * @returns Le résultat du traitement, contenant le contenu du fichier et ses options de sauvegarde.
   */
  public async processHandle(
    data: ClassroomExportData
  ): Promise<ProcessHandleResult> {
    // Génération du contenu DOCX
    const generatedContent = await generateDocxReport(
      resolveTemplatePath(DOCUMENT_TAMPLATES.contationSecondary),
      {
        // 'school' est indéfini ou null si non pertinent pour ce template spécifique
        school: undefined,
        classrooms: data,
      }
    );

    const exportOptions: SaveFileOptions = {
      defaultPath: "Fiches de cotations",
      title: this.getTitle(),
      filters: this.getFilters(),
    };

    return {
      success: true,
      result: {
        data: generatedContent,
        options: exportOptions,
      },
    };
  }
}

/**
 * Gère l'exportation de la liste des élèves inscrits.
 * * Cette classe permet de générer un document DOCX reprenant la liste des
 * élèves inscrits, en appliquant des filtres si nécessaire.
 */
export class EnrollementDocumentHandler extends AbstractDocumentHandler {
  /** Clé d'identification unique pour ce gestionnaire. */
  public readonly key = "ENROLLMENT_DOCX" as const;

  /** Type de fichier d'exportation. */
  public readonly type = DOCUMENT_EXTENSION.DOCX;

  /** Titre affiché à l'utilisateur. */
  public readonly title = "Fiches des Inscrits";

  /** Description de la fonctionnalité. */
  public readonly description =
    "Exporte la liste des élèves inscrits, filtrée selon les critères de sélection (classe, période, etc.).";

  /** Nom de la requête associée. */
  public readonly requestName = "classrooms.enrollments";

  /** Schéma de validation des options. */
  public readonly schema = DocumentExportSchema;

  /**
   * Traite les données d'inscription et génère le document DOCX.
   * @param data Les données d'exportation (liste des classes et leurs inscrits).
   * @returns Le résultat du traitement, contenant le contenu du fichier et ses options de sauvegarde.
   */
  public async processHandle(
    data: ClassroomExportData
  ): Promise<ProcessHandleResult> {
    // Génération du contenu DOCX basé sur le template d'inscription étudiant
    const generatedContent = await generateDocxReport(
      resolveTemplatePath(DOCUMENT_TAMPLATES.enrollementStudent),
      {
        school: undefined,
        classrooms: data,
      }
    );

    const exportOptions: SaveFileOptions = {
      title: this.getTitle(),
      defaultPath: "Liste-Inscrits",
      filters: this.getFilters(),
    };

    return {
      success: true,
      result: {
        data: generatedContent,
        options: exportOptions,
      },
    };
  }
}
