import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { generateDocxReport } from "@/packages/docx-template";
import type {} from "@/packages/@core/data-access/db/schemas/types";

export interface SeatingReportPayload {}

/**
 * Extension responsable de la génération des fiches de mise en place.
 */
export class SeatingExportDocxExtension extends AbstractExportExtension<SeatingReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description = "Génère les fiches de mise en place par local";

  private readonly TEMPLATE_NAME = "seatings.docx";

  public async process(payload: SeatingReportPayload): Promise<RawFileContent> {
    return generateDocxReport({
      templateName: this.TEMPLATE_NAME,
      templateData: payload,
    });
  }
}
