import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { generateDocxReport } from "@/packages/document-template";
import type { SeatingReportPayload } from "./type";

/**
 * Extension responsable de la génération des fiches de mise en place.
 */
export class SeatingPresenceExportDocxExtension extends AbstractExportExtension<SeatingReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description =
    "Génère les fiches de presences de mise en place par local";

  private readonly TEMPLATE_NAME = "seating-presence.docx";

  public async process(payload: SeatingReportPayload): Promise<RawFileContent> {
    return generateDocxReport({
      templateName: this.TEMPLATE_NAME,
      templateData: payload,
    });
  }
}
