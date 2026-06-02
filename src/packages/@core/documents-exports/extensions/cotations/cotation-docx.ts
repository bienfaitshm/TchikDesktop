import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import type { TSeatingSessionGrouped } from "@/packages/@core/data-access/db/queries/seating-queries";
import type { TSchool } from "@/packages/@core/data-access/db/schemas/types";

export type ExportPayload = TSchool & { assignment: TSeatingSessionGrouped };

export class FicheCotationExportExtension extends AbstractExportExtension<ExportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description = "Génère les fiches de cotation par salle";

  public async process(payload: ExportPayload): Promise<RawFileContent> {
    const buffer = "";
    return buffer as unknown as RawFileContent;
  }
}
