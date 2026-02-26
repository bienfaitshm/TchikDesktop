/**
 * Represents the different types of documents available for export.
 * Each type has a specific purpose and format.
 */
export enum DOCUMENT_TYPE {
  /**
   * Represents a list of enrolled students.
   * This document is typically used for administrative purposes or attendance tracking.
   */
  STUDENT_LIST = "STUDENT_LIST",

  COTATION_LISTE = "COTATION_LIST",

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

export const DOCUMENT_METADATA: Record<DOCUMENT_TYPE, DocumentMetaData> = {
  [DOCUMENT_TYPE.STUDENT_LIST]: {
    type: "document",
    title: "Liste des élèves inscrits",
    subTitle:
      "Exporter la liste des élèves inscrits pour une ou plusieurs classes.",
  },
  [DOCUMENT_TYPE.GRADING_SHEET]: {
    type: "document",
    title: "Fiche de cotation",
    subTitle: "Générer les fiches de cotation pour les élèves sélectionnés.",
  },
  [DOCUMENT_TYPE.ENROLLMENT_EXCEL]: {
    type: "sheet",
    title: "Liste des inscriptions (Excel)",
    subTitle: "Exporter les données d'inscription dans un fichier Excel.",
  },
  [DOCUMENT_TYPE.ENROLLMENT_STATISTICS]: {
    type: "document",
    title: "Statistiques d'inscription",
    subTitle:
      "Créer un document statistique sur les inscriptions pour une ou plusieurs classes.",
  },

  [DOCUMENT_TYPE.COTATION_LISTE]: {
    type: "document",
    title: "Fiches des contations",
    subTitle:
      "Exporter les fiches des cotation  pour une ou plusieurs classes.",
  },
};

type DocumentOption = Pick<DocumentMetaData, "type"> & {
  value: DOCUMENT_TYPE;
  label: Pick<DocumentMetaData, "subTitle" | "title">;
};

/**
 * Convertit le DOCUMENT_METADATA en un tableau d'options pour les interfaces utilisateur.
 * @returns Un tableau d'objets, chaque objet contenant la valeur de l'enum et le titre du document.
 */
export function getDocumentOptions(): DocumentOption[] {
  return Object.values(DOCUMENT_TYPE).map((documentType) => {
    const { type, ...rest } = DOCUMENT_METADATA[documentType];
    return {
      type,
      value: documentType,
      label: rest,
    };
  });
}
