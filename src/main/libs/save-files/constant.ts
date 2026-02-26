import type { SaveFileOptions } from "./save-files";

export const TXT_FILE_OPTIONS: SaveFileOptions = {
  defaultPath: "mon_fichier.txt",
  filters: [{ name: "Fichiers texte", extensions: ["txt"] }],
};

export const WORD_FILE_OPTIONS: SaveFileOptions = {
  defaultPath: "document.docx",
  title: "Enregistrer le fichier Word",
  filters: [
    { name: "Document Word", extensions: ["docx"] },
    { name: "Tous les fichiers", extensions: ["*"] },
  ],
};

export const EXCEL_FILE_OPTIONS: SaveFileOptions = {
  defaultPath: "Excel Document.xlsx",
  title: "Enregistrer le fichier Excel",
  filters: [
    { name: "Fichiers Excel", extensions: ["xlsx"] },
    { name: "Tous les fichiers", extensions: ["*"] },
  ],
};
