import { DocumentExportSchema } from "./schema";
import { AbstractDocumentHandler, ProcessHandleResult } from "./report";
import { SaveFileOptions } from "@/main/libs/save-files";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";

/**
 * 📝 Gestionnaire d'exportation pour le format JSON.
 */
export class EnrollmentJsonHandler extends AbstractDocumentHandler {
  // Propriétés Abstraites implémentées
  public readonly key = "ENROLLMENT_JSON";
  public readonly type = DOCUMENT_EXTENSION.JSON;
  public readonly title = "Liste des Inscrits (JSON)";
  public readonly description =
    "Exporte les données d'inscription brutes en format JSON.";
  public readonly requestName = "classrooms.enrollments";
  public readonly schema = DocumentExportSchema;

  /**
   * Traite les données d'inscription et génère une chaîne JSON.
   */
  public async processHandle(data: unknown): Promise<ProcessHandleResult> {
    const enrollments = data as Array<any>;

    // --- 1. Logique de transformation et de génération (JSON) ---
    // Sérialisation des données en JSON avec un formatage lisible (indentation à 2 espaces)
    const jsonContent = JSON.stringify(enrollments, null, 2);
    const generatedContent = Buffer.from(jsonContent, "utf-8");

    // --- 2. Définition des options d'exportation ---
    const exportOptions: SaveFileOptions = {
      title: this.getTitle(),
      defaultPath: "Liste-Inscrits-JSON",
      filters: [{ extensions: ["json"], name: "Fichier JSON" }],
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
