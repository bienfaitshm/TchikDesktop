import iconv from "iconv-lite";
import type { Printer } from "@node-escpos/core";

export const ESC = "\x1B";
export const CMD_SET_PC850 = Buffer.from([0x1b, 0x74, 0x02]); // ESC t 2  (PC850)
export const CMD_SET_WPC1252 = Buffer.from([0x1b, 0x74, 0x10]);

export function initialize(printer: Printer<[]>) {
  printer.raw(CMD_SET_PC850);
}

// Fonction pour envoyer du texte correctement encodé
export function writeText(printer: Printer<[]>, text: string) {
  // Convertit la chaîne JS (UTF-8) vers le format binaire cp850
  const buffer = iconv.encode(text + "\n", "cp850");
  printer.raw(buffer);
}
