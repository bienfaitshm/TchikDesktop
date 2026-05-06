import { AbstractExportExtension } from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { json2csv } from "json-2-csv";

/**
 * Moteur de rendu CSV.
 * Transforme un tableau d'objets en chaîne CSV avec délimiteur point-virgule.
 */
export class CsvExportExtension extends AbstractExportExtension<
  Record<string, unknown>[]
> {
  readonly extension = DOCUMENT_EXTENSION.CSV;

  public process(data: Record<string, unknown>[]): string {
    if (!data || data.length === 0) {
      return "";
    }

    try {
      return json2csv(data, {
        delimiter: { field: ";" },
        emptyFieldValue: "",
      });
    } catch (error) {
      throw new Error(
        `Erreur lors de la conversion CSV : ${error instanceof Error ? error.message : "Format invalide"}`,
      );
    }
  }
}

/**
 * Moteur de rendu JSON.
 * Produit un flux JSON formaté pour la lisibilité.
 */
export class JsonExportExtension extends AbstractExportExtension<
  Record<string, unknown>[]
> {
  readonly extension = DOCUMENT_EXTENSION.JSON;

  public process(data: Record<string, unknown>[]): string {
    try {
      return JSON.stringify(data ?? [], null, 2);
    } catch (error) {
      throw new Error(
        "Échec de la sérialisation JSON : structure circulaire ou invalide détectée.",
      );
    }
  }
}
