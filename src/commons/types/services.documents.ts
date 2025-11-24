import {
  DOCUMENT_CATEGORY,
  DOCUMENT_EXTENSION,
} from "@/commons/constants/file-extension";

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
