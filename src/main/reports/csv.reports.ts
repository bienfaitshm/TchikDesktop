import { DocumentExportSchema } from "./schema";
import { AbstractDocumentHandler, ProcessHandleResult } from "./report";
import { SaveFileOptions } from "@/main/libs/save-files";
import type { ZodType, ZodTypeDef } from "zod";

/**
 * Fonction utilitaire simple pour convertir un tableau d'objets en CSV.
 * @param data Tableau d'objets (les inscriptions).
 */
function convertToCsv(data: Array<Record<string, any>>): string {
  if (!data || data.length === 0) return "";

  // 1. Déterminer les en-têtes (basé sur les clés du premier objet)
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(";"); // Utilisation du point-virgule comme séparateur

  // 2. Créer les lignes de données
  const dataRows = data.map((obj) =>
    headers
      .map((header) => {
        let value =
          obj[header] !== undefined && obj[header] !== null
            ? String(obj[header])
            : "";
        // Gère les valeurs contenant le séparateur (guillemets)
        if (
          value.includes(";") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          value = `"${value.replace(/"/g, '""')}"`; // Échappe les guillemets
        }
        return value;
      })
      .join(";")
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * 📊 Gestionnaire d'exportation pour le format CSV.
 */
export class EnrollmentCsvHandler extends AbstractDocumentHandler {
  // Propriétés Abstraites implémentées
  public readonly key = "ENROLLMENT_CSV";
  public readonly type = "csv"; // Type de fichier
  public readonly title = "Liste des Inscrits (CSV)";
  public readonly description =
    "Exporte les données d'inscription brutes en format CSV (compatible tableur).";
  public readonly requestName = "classrooms.enrollments";
  public schema: ZodType<any, ZodTypeDef, any> = DocumentExportSchema;

  /**
   * Traite les données d'inscription et génère une chaîne CSV.
   */
  public async processHandle(data: unknown): Promise<ProcessHandleResult> {
    // Le cast est sécurisé si les données sont bien des objets plats (assuré par AppDataSystem)
    const enrollments = data as Array<Record<string, any>>;

    // --- 1. Logique de transformation et de génération (CSV) ---
    const csvContent = convertToCsv(enrollments);
    const generatedContent = Buffer.from(csvContent, "utf-8");

    // --- 2. Définition des options d'exportation ---
    const exportOptions: SaveFileOptions = {
      title: this.getTitle(),
      defaultPath: "Liste-Inscrits-CSV",
      filters: [{ extensions: ["csv"], name: "Fichier CSV" }],
    };

    return {
      success: true,
      result: {
        data: generatedContent,
        options: exportOptions,
      },
    };
  }
}
