/**
 * Represents the different types of documents available for export.
 * Each type has a specific purpose and format.
 */
export enum DocumentType {
  /**
   * Represents a list of enrolled students.
   * This document is typically used for administrative purposes or attendance tracking.
   */
  STUDENT_LIST = "STUDENT_LIST",

  /**
   * Represents a grading sheet used to record and manage student grades.
   */
  GRADING_SHEET = "GRADING_SHEET",

  /**
   * Represents enrollment data formatted for a spreadsheet application like Excel.
   * This format is optimized for data analysis and filtering.
   */
  ENROLLMENT_EXCEL = "ENROLLMENT_EXCEL",

  /**
   * Represents a document containing statistical data on student enrollments.
   * It is used for reporting and strategic decision-making.
   */
  ENROLLMENT_STATISTICS = "ENROLLMENT_STATISTICS",
}

export type DocumentMetaData = {
  title: string;
  subTitle: string;
  type: "sheet" | "document";
};

export const DOCUMENT_METADATA: Record<DocumentType, DocumentMetaData> = {
  [DocumentType.STUDENT_LIST]: {
    type: "document",
    title: "Liste des élèves inscrits",
    subTitle:
      "Exporter la liste des élèves inscrits pour une ou plusieurs classes.",
  },
  [DocumentType.GRADING_SHEET]: {
    type: "document",
    title: "Fiche de cotation",
    subTitle: "Générer les fiches de cotation pour les élèves sélectionnés.",
  },
  [DocumentType.ENROLLMENT_EXCEL]: {
    type: "sheet",
    title: "Liste des inscriptions (Excel)",
    subTitle: "Exporter les données d'inscription dans un fichier Excel.",
  },
  [DocumentType.ENROLLMENT_STATISTICS]: {
    type: "document",
    title: "Statistiques d'inscription",
    subTitle:
      "Créer un document statistique sur les inscriptions pour une ou plusieurs classes.",
  },
};

type DocumentOption = {
  value: DocumentType;
  label: DocumentMetaData;
};

/**
 * Convertit le DOCUMENT_METADATA en un tableau d'options pour les interfaces utilisateur.
 * @returns Un tableau d'objets, chaque objet contenant la valeur de l'enum et le titre du document.
 */
export function getDocumentOptions(): DocumentOption[] {
  return Object.values(DocumentType).map((documentType) => ({
    value: documentType,
    label: DOCUMENT_METADATA[documentType],
  }));
}
