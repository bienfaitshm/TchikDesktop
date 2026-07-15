/**
 * @description Moteurs de rendu universels pour les exports CSV et JSON.
 */

import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { json2csv } from "json-2-csv";

/**
 * Type représentant un enregistrement de données structuré pour l'export.
 */
export type ExportableRecord = Record<string, unknown>;

/**
 * Options de configuration pour le formateur CSV.
 */
export interface CsvFormatterOptions {
  delimiter?: string;
  emptyFieldValue?: string;
}

/**
 * Moteur de rendu CSV universel.
 * @template T Type de la donnée d'entrée (Objet simple ou collection d'objets).
 */
export class CsvExportExtension<
  T extends ExportableRecord | ExportableRecord[],
> extends AbstractExportExtension<T> {
  public readonly extension = DOCUMENT_EXTENSION.CSV;
  public readonly description = undefined;

  private readonly delimiter: string;
  private readonly emptyFieldValue: string;

  constructor(options: CsvFormatterOptions = {}) {
    super();
    this.delimiter = options.delimiter ?? ";";
    this.emptyFieldValue = options.emptyFieldValue ?? "";
  }

  /**
   * Transforme les données d'entrée en flux CSV.
   * Si un objet unique est fourni, il est encapsulé dans un tableau à ligne unique.
   */
  public async process(data: T): Promise<RawFileContent> {
    if (!data) {
      return "";
    }

    const normalizedData = Array.isArray(data) ? data : [data];

    // Cas limite : Si le tableau est vide, on évite d'appeler le parseur inutilement
    if (normalizedData.length === 0) {
      return "";
    }

    try {
      return json2csv(normalizedData, {
        delimiter: { field: this.delimiter },
        emptyFieldValue: this.emptyFieldValue,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Incompatible data structure";
      throw new Error(`CSV conversion pipeline failed: ${errorMessage}`, {
        cause: error,
      });
    }
  }
}

/**
 * Moteur de rendu JSON universel.
 * @template T Type de la donnée d'entrée.
 */
export class JsonExportExtension<T> extends AbstractExportExtension<T> {
  public readonly extension = DOCUMENT_EXTENSION.JSON;
  public readonly description = undefined;

  private readonly spaceIndentation: number;

  constructor(spaceIndentation = 2) {
    super();
    this.spaceIndentation = spaceIndentation;
  }

  /**
   * Sérialise la structure de données en chaîne JSON formatée.
   */
  public async process(data: T): Promise<RawFileContent> {
    try {
      const fallbackData = data ?? [];
      return JSON.stringify(fallbackData, null, this.spaceIndentation);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Circular or invalid structure";
      throw new Error(`JSON serialization pipeline failed: ${errorMessage}`, {
        cause: error,
      });
    }
  }
}
