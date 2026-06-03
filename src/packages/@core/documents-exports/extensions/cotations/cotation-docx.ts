import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import type { TSeatingSessionGrouped } from "@/packages/@core/data-access/db/queries/seating-queries";
import type { TSchool } from "@/packages/@core/data-access/db/schemas/types";
import { generateDocxReport } from "@/packages/docx-template";

export type ExportPayload = TSchool & { assignment: TSeatingSessionGrouped };

const TEMPLATE_NAME = "cotations-secondary.docx";
export class FicheCotationExportExtension extends AbstractExportExtension<ExportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description = "Génère les fiches de cotation par salle";

  public async process(payload: ExportPayload): Promise<RawFileContent> {
    const buffer = generateDocxReport({
      templateName: TEMPLATE_NAME,
      templateData: { ...payload, name: this.description },
    });
    return buffer as unknown as RawFileContent;
  }
}
