// Fichier: InvoiceDocumentHandler.ts

import { DocumentExportSchema } from "./schema";
import { AbstractDocumentHandler, ProcessHandleResult } from "./report";
import { SaveFileOptions } from "../libs/save-files";

export class InvoiceDocumentHandler extends AbstractDocumentHandler {
  // Propriétés Abstraites implémentées
  public readonly key = "INVOICE_REPORT";
  public readonly type = "docx";
  public readonly title = "Rapport de Facturation Mensuel";
  public readonly description = "Exporte toutes les factures du mois spécifié.";
  public readonly requestName = "GET_MONTHLY_INVOICES";
  public readonly schema = DocumentExportSchema;

  // Méthode Abstraite implémentée
  public async processHandle(data: unknown): Promise<ProcessHandleResult> {
    // Le type de 'data' est connu ici grâce à la configuration du DataSystem
    const invoices = data as Array<any>;

    // 1. Logique de transformation et de génération du fichier
    // ... générer le PDF ...
    const generatedContent = Buffer.from(
      `Contenu du PDF pour ${invoices.length} factures`
    );

    return {
      success: true,
      result: {
        data: generatedContent,
        options: {
          defaultPath: "Rapport-Factures-2025",
          title: this.getTitle(),
          filters: [{ extensions: ["pdf"], name: "Document Portable" }],
        },
      },
    };
  }
}

/**
 * Gère l'exportation des fiches d'inscription des élèves.
 */
export class EnrollementDocumentHandler extends AbstractDocumentHandler {
  // Propriétés Abstraites implémentées
  public readonly key = "ENROLLMENT_DOCX";
  public readonly type = "docx";
  public readonly title = "Fiches des Inscrits";
  public readonly description =
    "Exporte la liste des élèves selon les filtres d'inscription.";
  public readonly requestName = "classrooms.enrollments";
  // Utilisation du schéma importé
  public readonly schema = DocumentExportSchema;

  /**
   * Traite les données d'inscription et génère le document DOCX.
   */
  public async processHandle(data: unknown): Promise<ProcessHandleResult> {
    // ⚠️ Supposons que 'data' est le résultat de l'appel API, c'est-à-dire un tableau d'inscriptions.
    const enrollments = data as Array<any>;
    // --- 1. Logique de transformation et de génération ---

    // Simuler la génération du document DOCX
    const generatedContent = Buffer.from(
      `Contenu du DOCX pour ${enrollments.length} inscriptions`
    );

    // --- 2. Définition des options d'exportation ---
    const exportOptions: SaveFileOptions = {
      title: this.getTitle(),
      defaultPath: "Liste-Inscrits",
      // Format d'options plus standard
      filters: [{ extensions: ["docx"], name: "Document Word" }],
      // mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // MIME type standard pour DOCX
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
