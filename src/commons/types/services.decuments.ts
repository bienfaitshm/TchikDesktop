export interface DocumentInfo {
  /** Clé unique identifiant le type de document (utilisé dans la requête d'exportation). */
  key: string;
  /** Titre lisible du document. */
  type: string;
  title: string;
  /** Description détaillée de ce que le document contient. */
  description: string;
}
