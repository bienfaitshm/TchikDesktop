import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { generateDocxReport } from "@/packages/document-template";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { EnrollmentReportPayload } from "./type";

/**
 * Extension responsable de la génération du rapport d'inscription.
 */
export class EnrollmentReportExportDocxExtension extends AbstractExportExtension<EnrollmentReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description =
    "Génère la fiche contenant la liste des inscrits par salle";

  private readonly TEMPLATE_NAME = "enrollment-students.docx";

  public async process(
    payload: EnrollmentReportPayload,
  ): Promise<RawFileContent> {
    return generateDocxReport({
      templateName: this.TEMPLATE_NAME,
      templateData: payload,
    });
  }
}
