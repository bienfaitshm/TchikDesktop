/**
 * @file enrollments.engines.ts
 * @description Moteurs de rendu universels CSV et JSON.
 * Gère dynamiquement les objets uniques ou les collections.
 */

import { AbstractExportExtension } from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { json2csv } from "json-2-csv";

/**
 * Moteur de rendu CSV universel.
 * @template T Type de la donnée d'entrée (Objet ou Tableau d'objets).
 */
export class CsvExportExtension<
  T extends object | object[],
> extends AbstractExportExtension<T> {
  readonly extension = DOCUMENT_EXTENSION.CSV;

  /**
   * Transforme les données en CSV.
   * Si un objet unique est passé, il est automatiquement traité comme une ligne unique.
   */
  public process(data: T): string {
    if (!data) return "";

    const normalizedData = Array.isArray(data) ? data : [data];

    try {
      return json2csv(normalizedData, {
        delimiter: { field: ";" },
        emptyFieldValue: "",
      });
    } catch (error) {
      throw new Error(
        `Erreur de conversion CSV : ${
          error instanceof Error
            ? error.message
            : "Structure de données incompatible"
        }`,
      );
    }
  }
}

/**
 * Moteur de rendu JSON universel.
 * @template T Type de la donnée d'entrée.
 */
export class JsonExportExtension<T> extends AbstractExportExtension<T> {
  readonly extension = DOCUMENT_EXTENSION.JSON;

  public process(data: T): string {
    try {
      return JSON.stringify(data ?? [], null, 2);
    } catch (error) {
      throw new Error(
        "Échec de la sérialisation JSON : structure circulaire ou invalide.",
      );
    }
  }
}
