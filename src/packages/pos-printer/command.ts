import iconv from "iconv-lite";
import type { Printer } from "@node-escpos/core";

export const ESC = "\x1B";

/** Commandes brutes ESC/POS pour les tables de caractères */
export const CODE_TABLES = {
  PC850: Buffer.from([0x1b, 0x74, 0x02]), // ESC t 2
  WPC1252: Buffer.from([0x1b, 0x74, 0x10]), // ESC t 16
} as const;

export type SupportedEncoding = "cp850" | "win1252";

/**
 * Initialise l'imprimante avec la table de caractères matérielle souhaitée.
 */
export function initializePrinter(
  printer: Printer<[]>,
  table: keyof typeof CODE_TABLES = "PC850",
): void {
  printer.raw(CODE_TABLES[table]);
}

/**
 * Nettoie la chaîne des caractères invisibles ou problématiques pour l'imprimante
 */
function sanitizeForThermal(text: string): string {
  return (
    text
      // Remplace les espaces insécables (NBSP de formatCurrency) par un espace standard
      .replace(/[\u00A0\u202F]/g, " ")
      // Remplace les apostrophes typographiques courbes par une apostrophe droite
      .replace(/[’‘`]/g, "'")
  );
}

/**
 * Envoie du texte encodé en binaire à l'imprimante.
 */
export function writeText(
  printer: Printer<[]>,
  text: string,
  encoding: SupportedEncoding = "cp850",
  addNewline: boolean = true,
): void {
  const cleanText = sanitizeForThermal(text) + (addNewline ? "\n" : "");
  const buffer = iconv.encode(cleanText, encoding);
  printer.raw(buffer);
}
