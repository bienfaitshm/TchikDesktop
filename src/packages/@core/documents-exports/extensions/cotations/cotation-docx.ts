import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import type {
  TEnrolement,
  TSchool,
  TUser,
} from "@/packages/@core/data-access/db/schemas/types";
import { generateDocxReport } from "@/packages/docx-template";

export interface CotationReportPayload extends TSchool {
  classrooms: (TEnrolement & { student: TUser })[];
}

/**
 * Extension responsable de la génération des fiches de cotation.
 */
export class CotationReportExportDocxExtension extends AbstractExportExtension<CotationReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description = "Génère les fiches de cotation par salle";

  private readonly TEMPLATE_NAME = "cotations-secondary.docx";

  public async process(
    payload: CotationReportPayload,
  ): Promise<RawFileContent> {
    return generateDocxReport({
      templateName: this.TEMPLATE_NAME,
      templateData: payload,
    });
  }
}
