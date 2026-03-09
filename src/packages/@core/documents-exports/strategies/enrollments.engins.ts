import { AbstractExportExtension } from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { json2csv } from "json-2-csv";

/**
 * Moteur de rendu CSV universel.
 */
export class CsvExportExtension extends AbstractExportExtension<any[]> {
  readonly extension = DOCUMENT_EXTENSION.CSV;

  public process(data: any[]): string {
    if (!data || data.length === 0) return "";
    // On utilise la lib json2csv pour la robustesse (gestion des virgules, quotes, etc.)
    return json2csv(data, { delimiter: { field: ";" } });
  }
}

/**
 * Moteur de rendu JSON universel.
 */
export class JsonExportExtension extends AbstractExportExtension<any[]> {
  readonly extension = DOCUMENT_EXTENSION.JSON;

  public process(data: any[]): string {
    return JSON.stringify(data, null, 2);
  }
}
