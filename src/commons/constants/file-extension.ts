/** Énumération des extensions de fichiers supportées. */
export enum DOCUMENT_EXTENSION {
  // Données Structurées
  JSON = "json",
  CSV = "csv",
  XML = "xml",
  YAML = "yaml",

  // Tableurs
  XLSX = "xlsx",
  XLS = "xls",
  ODS = "ods",

  // Documents Texte
  DOCX = "docx",
  DOC = "doc",
  ODT = "odt",
  RTF = "rtf",
  TXT = "txt",
  MD = "md",

  // Lecture Seule / Imprimable
  PDF = "pdf",

  // Présentations
  PPTX = "pptx",
  PPT = "ppt",
  ODP = "odp",
}

/** Énumération des catégories de documents pour le regroupement dans l'interface utilisateur. */
export enum DOCUMENT_CATEGORY {
  DATA = "Données & Structure",
  SPREADSHEET = "Feuilles de Calcul",
  TEXT_DOCUMENT = "Documents Texte",
  READ_ONLY = "Lecture Seule & Imprimable",
  PRESENTATION = "Présentations",
  // Ajout d'une catégorie UNKNOWN pour la robustesse, même si elle ne devrait pas être utilisée si le mapping est complet.
  UNKNOWN = "Inconnu",
}

/** Translations (labels) pour les extensions. */
export const DOCUMENT_EXTENSION_TRANSLATIONS: Record<
  DOCUMENT_EXTENSION,
  string
> = {
  // Données Structurées
  [DOCUMENT_EXTENSION.JSON]: "JSON (Données)",
  [DOCUMENT_EXTENSION.CSV]: "CSV (Valeurs séparées par des virgules)",
  [DOCUMENT_EXTENSION.XML]: "XML (Markup Language)",
  [DOCUMENT_EXTENSION.YAML]: "YAML (Configuration)",

  // Tableurs
  [DOCUMENT_EXTENSION.XLSX]: "Feuille de calcul Excel (moderne)",
  [DOCUMENT_EXTENSION.XLS]: "Feuille de calcul Excel (ancienne)",
  [DOCUMENT_EXTENSION.ODS]: "Feuille de calcul OpenDocument",

  // Documents Texte
  [DOCUMENT_EXTENSION.DOCX]: "Document Word (moderne)",
  [DOCUMENT_EXTENSION.DOC]: "Document Word (ancien)",
  [DOCUMENT_EXTENSION.ODT]: "Document Texte OpenDocument",
  [DOCUMENT_EXTENSION.RTF]: "Rich Text Format",
  [DOCUMENT_EXTENSION.TXT]: "Texte Brut",
  [DOCUMENT_EXTENSION.MD]: "Markdown",

  // Lecture Seule / Imprimable
  [DOCUMENT_EXTENSION.PDF]: "Portable Document Format (PDF)",

  // Présentations
  [DOCUMENT_EXTENSION.PPTX]: "Présentation PowerPoint (moderne)",
  [DOCUMENT_EXTENSION.PPT]: "Présentation PowerPoint (ancienne)",
  [DOCUMENT_EXTENSION.ODP]: "Présentation OpenDocument",
};

/**
 * Interface pour les informations d'un document à exporter.
 * Utilise DOCUMENT_EXTENSION pour garantir la sécurité des types.
 */
export interface DocumentInfo {
  /** Clé unique identifiant le type de document (utilisé dans la requête d'exportation). */
  key: string;
  /** Titre lisible du document. */
  title: string;
  /** Extension du fichiers, contrainte aux valeurs de l'énumération. */
  type: DOCUMENT_EXTENSION;
  /** Description détaillée de ce que le document contient. */
  description: string;
}

/** Représente un seul choix dans la liste des options affichées. */
export interface DocumentOption {
  value: string;
  label: {
    title: string;
    subTitle: string;
  };
}

/** Représente un groupe d'options pour l'affichage dans l'interface utilisateur. */
export interface GroupedDocumentOption {
  section: DOCUMENT_CATEGORY; // Le titre de la section, issu de l'énumération
  data: DocumentOption[];
}

/**
 * Consolide le mapping entre les catégories et les extensions.
 */
interface CategoryRegistry {
  category: DOCUMENT_CATEGORY;
  extensions: DOCUMENT_EXTENSION[];
}

export const DATA_REGISTER: CategoryRegistry[] = [
  {
    category: DOCUMENT_CATEGORY.SPREADSHEET,
    extensions: [
      DOCUMENT_EXTENSION.XLSX,
      DOCUMENT_EXTENSION.XLS,
      DOCUMENT_EXTENSION.ODS,
    ],
  },
  {
    category: DOCUMENT_CATEGORY.READ_ONLY,
    extensions: [DOCUMENT_EXTENSION.PDF],
  },
  {
    category: DOCUMENT_CATEGORY.PRESENTATION,
    extensions: [
      DOCUMENT_EXTENSION.PPTX,
      DOCUMENT_EXTENSION.PPT,
      DOCUMENT_EXTENSION.ODP,
    ],
  },
  {
    category: DOCUMENT_CATEGORY.TEXT_DOCUMENT,
    extensions: [
      DOCUMENT_EXTENSION.DOCX,
      DOCUMENT_EXTENSION.DOC,
      DOCUMENT_EXTENSION.ODT,
      DOCUMENT_EXTENSION.RTF,
      DOCUMENT_EXTENSION.TXT,
      DOCUMENT_EXTENSION.MD,
    ],
  },
  {
    category: DOCUMENT_CATEGORY.DATA,
    extensions: [
      DOCUMENT_EXTENSION.JSON,
      DOCUMENT_EXTENSION.CSV,
      DOCUMENT_EXTENSION.XML,
      DOCUMENT_EXTENSION.YAML,
    ],
  },
];

/**
 * ========================================
 * 4. FONCTIONS UTILITAIRES
 * ========================================
 */

/**
 * Mappe une extension à sa catégorie de document en parcourant le DATA_REGISTER.
 * @param extension L'extension du document.
 * @returns La catégorie correspondante.
 */
export function getDocumentCategory(
  extension: DOCUMENT_EXTENSION
): DOCUMENT_CATEGORY {
  // Parcourt le registre et vérifie si l'extension est incluse dans le tableau d'extensions du groupe
  const entry = DATA_REGISTER.find((entry) =>
    entry.extensions.includes(extension)
  );

  // Retourne la catégorie trouvée, ou UNKNOWN si l'extension n'est pas répertoriée
  return entry ? entry.category : DOCUMENT_CATEGORY.UNKNOWN;
}
