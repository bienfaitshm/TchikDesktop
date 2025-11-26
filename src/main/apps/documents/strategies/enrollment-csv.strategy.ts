/**
 * @file enrollment-csv.strategy.ts
 * @description Stratégie concrète pour l'exportation des données d'inscription au format CSV.
 * Utilise un sérialiseur robuste pour gérer l'échappement des séparateurs et des guillemets.
 */

import { z, ZodSchema } from "zod";
import { AbstractExportStrategy } from "./abstract-document-strategy";
import {
  ServiceOperationResult,
  ExportArtifact,
} from "@/main/apps/documents/document-export.service";
import { SaveFileOptions } from "@/main/libs/save-files";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";
import * as schemas from "./schemas";

// ==========================================
// 1. CSV Utility (Module d'Ingénierie)
// ==========================================

/**
 * Séparateur standard utilisé en Europe (point-virgule).
 * Utiliser une constante rend le code configurable.
 */
const CSV_DELIMITER = ";";

/**
 * 🏭 Sérialiseur de données : Convertit un tableau d'objets en chaîne CSV.
 * Utilise la convention double-quote pour l'échappement si le délimiteur est présent.
 * @param data Tableau d'objets plats.
 * @returns La chaîne CSV formatée.
 */
function serializeToCsv(data: Array<Record<string, unknown>>): string {
  if (!data || data.length === 0) return "";

  // 1. Extraction des en-têtes à partir du premier objet (Assumer l'uniformité)
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(CSV_DELIMITER);

  // 2. Création des lignes de données avec échappement
  const dataRows = data.map((obj) =>
    headers
      .map((header) => {
        // Remplacement de undefined/null par chaîne vide
        let value =
          obj[header] !== undefined && obj[header] !== null
            ? String(obj[header])
            : "";

        // Nettoyage et Échappement : Supprime les retours à la ligne et protège les guillemets/délimiteurs.
        value = value.replace(/\r?\n|\r/g, " "); // Optionnel: Remplacer les retours chariot par un espace.

        if (value.includes(CSV_DELIMITER) || value.includes('"')) {
          // Double-quote l'ensemble du champ et échappe les guillemets internes par double guillemets ("")
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(CSV_DELIMITER)
  );

  return [headerRow, ...dataRows].join("\n");
}

// ==========================================
// 2. Stratégie Concrète
// ==========================================

/**
 * 📊 Stratégie d'Exportation : Gère la sérialisation des listes d'inscrits au format CSV.
 */

// Utiliser le type de données que l'on sait être reçu par le Query Handler
type EnrollmentData = Array<Record<string, unknown>>;
type CsvParams = z.infer<typeof schemas.DocumentExportSchema>;

export class EnrollmentCsvStrategy extends AbstractExportStrategy<
  CsvParams,
  EnrollmentData
> {
  public readonly strategyId = "ENROLLMENT_CSV" as const;
  public readonly fileExtension = DOCUMENT_EXTENSION.CSV;
  public readonly displayName = "Liste des Inscrits (CSV)";
  public readonly description =
    "Exporte les données d'inscription brutes en format CSV pour l'analyse ou l'import dans tableur.";
  public readonly dataSourceDefinition = "classrooms.enrollments";
  public readonly validationSchema: ZodSchema<any> =
    schemas.DocumentExportSchema;

  /**
   * 🏭 Transforme les données d'inscription brutes en un Buffer CSV.
   * @param data Les données d'inscription typées (EnrollmentData).
   */
  public async generateArtifact(
    data: EnrollmentData
  ): Promise<ServiceOperationResult<ExportArtifact>> {
    try {
      // --- 1. Sérialisation ---
      const csvContent = serializeToCsv(data);
      // Utilisation de Buffer.from pour un encodage explicite (bonne pratique)
      const generatedBuffer = Buffer.from(csvContent, "utf-8");

      // --- 2. Options d'Exportation ---
      const exportOptions: SaveFileOptions = {
        title: this.getDisplayName(),
        // Nom de fichier dynamique avec la date (pour éviter l'écrasement)
        defaultPath: `Liste-Inscrits-${this.generateDateSuffix()}.csv`,
        // Utilisation de la fonction helper du parent
        filters: this.getElectronFileFilters(),
      };

      return {
        success: true,
        payload: {
          content: generatedBuffer,
          fileSystemOptions: exportOptions,
        },
      };
    } catch (error) {
      // Gestion des erreurs de sérialisation
      return {
        success: false,
        error: {
          code: "CSV_SERIALIZATION_FAILED",
          message: `Échec de la conversion en CSV: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
          details: error,
        },
      };
    }
  }
}
