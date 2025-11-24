import { SaveFileOptions } from "@/main/libs/save-files";
import { ZodSchema } from "zod";
import { DocumentHandler } from "@/main/apps/documents/document-export-service";

/**
 * 📄 Résultat de la génération d'un document.
 * Contient les données binaires du document et les options nécessaires pour le dialogue de sauvegarde.
 */
export type DocumentGenerationResult = {
  /** Le contenu binaire ou l'objet du document généré. */
  data: unknown;
  /** Les options de sauvegarde du fichier (nom par défaut, extension, MIME type). */
  options: SaveFileOptions;
};

export type ValidationResult =
  | { success: true; data: unknown }
  | { success: false; message: string };

export type ProcessHandleResult =
  | { success: true; result: DocumentGenerationResult }
  | { success: false; errorMessage: string };

/**
 * 💡 Classe de base abstraite pour tous les gestionnaires d'exportation de documents (DocumentHandler).
 * Elle implémente la logique commune et répétitive :
 * 1. La gestion des propriétés d'information (key, title, description).
 * 2. La validation des paramètres en utilisant le schéma Zod.
 *
 * Les classes dérivées doivent implémenter:
 * - `requestName` (propriété)
 * - `schema` (propriété)
 * - `processHandle` (méthode)
 */
export abstract class AbstractDocumentHandler implements DocumentHandler {
  // --- Propriétés à Définir par la Classe Fille ---
  /** 🔑 Clé unique pour identifier ce document dans le système. */
  public abstract readonly key: string;
  /** 📄 Type de document affiché à l'utilisateur. */
  public abstract readonly type?: string;
  /** 📄 Titre lisible affiché à l'utilisateur. */
  public abstract readonly title: string;
  /** 📖 Description du contenu du document. */
  public abstract readonly description: string;
  /** ⚙️ Nom de la requête pour extraire les données brutes via le DataSystem. */
  public abstract readonly requestName: string;
  /** 🛡️ Schéma Zod utilisé pour valider les paramètres de la requête d'exportation. */
  public abstract readonly schema: ZodSchema;

  /** Retourne la clé unique pour ce document. (Implémentation DRY) */
  public getKey(): string {
    return this.key;
  }
  /** Retourne la clé unique pour ce document. (Implémentation DRY) */
  public getType(): string {
    return this?.type || "docx";
  }
  /** Retourne le titre public pour ce document. (Implémentation DRY) */
  public getTitle(): string {
    return this.title;
  }
  /** Retourne la description publique pour ce document. (Implémentation DRY) */
  public getDescription(): string {
    return this.description;
  }
  /** Retourne le nom de la requête à exécuter sur le système de données. (Implémentation DRY) */
  public getRequestName(): string {
    return this.requestName;
  }

  /**
   * 🛡️ Valide les paramètres de la requête fournis par l'utilisateur en utilisant le schéma Zod prédéfini.
   * Cette implémentation de base élimine la duplication de la logique de validation.
   *
   * @param params Les paramètres bruts (unknown) reçus de l'API.
   * @returns Le résultat de la validation. En cas de succès, `data` contient les paramètres typés et nettoyés.
   */
  public validate(params: unknown): ValidationResult {
    const result = this.schema.safeParse(params);
    if (result.success) {
      return { success: true, data: result.data };
    }

    // Formatage des erreurs Zod pour un message clair
    const errors = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");

    return {
      success: false,
      message: `Erreur de validation des paramètres: ${errors}`,
    };
  }

  /**
   * 🏭 Méthode abstraite pour la génération du document. C'est le cœur de la logique métier.
   * Doit être implémentée par chaque document spécifique.
   *
   * @param data Les données brutes obtenues du système de données (déjà typées et validées par la classe fille).
   * @returns Une promesse résolue avec le résultat du traitement (DocumentGenerationResult).
   */
  public abstract processHandle(data: unknown): Promise<ProcessHandleResult>;
}
