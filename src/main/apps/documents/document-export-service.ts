import { response } from "@/commons/libs/electron-apis/utils";
import { SaveFileOptions, saveFileWithDialog } from "@/main/libs/save-files";
import { Status } from "@/commons/libs/electron-apis/constant";
import type { RouteHandler } from "@/commons/libs/electron-apis/server";
import { DocumentFilter } from "@/commons/types/services";

/**
 * 📄 Résultat de la génération d'un document.
 * Contient les données binaires du document et les options nécessaires pour le dialogue de sauvegarde.
 */
export type DocumentGenerationResult = {
  /** Le contenu binaire ou l'objet du document généré. */
  data: any;
  /** Les options de sauvegarde du fichier (nom par défaut, extension, MIME type). */
  options: SaveFileOptions;
};

/**
 * 📝 Informations publiques décrivant un document exportable.
 * Utilisé pour afficher la liste des documents disponibles dans l'interface utilisateur.
 */
export interface DocumentInfo {
  /** Clé unique identifiant le type de document (utilisé dans la requête d'exportation). */
  key: string;
  /** Le type de document ex.(PDf, Word, Sheet etc) */
  type: string;
  /** Titre lisible du document. */
  title: string;
  /** Description détaillée de ce que le document contient. */
  description: string;
}

/**
 * 🛠️ Résultat d'une validation de paramètres.
 */
export type ValidationResult =
  | { success: true; data: unknown }
  | { success: false; message: string };

/**
 * 🔄 Résultat du traitement d'un document par son gestionnaire (Handler).
 */
export type ProcessHandleResult =
  | { success: true; result: DocumentGenerationResult }
  | { success: false; errorMessage: string };

/**
 * 💾 Résultat de l'appel au système de données.
 */
export type DataSystemResult =
  | { success: true; data: unknown }
  | { success: false; errorMessage: string };

export type TApiHandler<
  TRes,
  TData,
  TParams extends {} = {},
> = () => RouteHandler<TRes, TData, TParams>;

/**
 * 📜 Interface définissant un gestionnaire (Handler) de document exportable.
 * Chaque implémentation est responsable de sa propre logique d'extraction, de validation et de génération.
 */
export interface DocumentHandler {
  /** Retourne la clé unique pour ce document. */
  getKey(): string;
  /** Retourne le type pulique pour ce document.*/
  getType(): string;
  /** Retourne le titre public pour ce document. */
  getTitle(): string;
  /** Retourne la description publique pour ce document. */
  getDescription(): string;
  /** Valide les paramètres de la requête fournis par l'utilisateur. */
  validate(params: unknown): ValidationResult;
  /** Retourne le nom de la requête à exécuter sur le système de données pour obtenir les informations brutes. */
  getRequestName(): string;
  /**
   * Traite les données brutes extraites pour générer le contenu du document.
   * @param data Les données brutes obtenues du système de données.
   */
  processHandle(data: unknown): Promise<ProcessHandleResult>;
}

/**
 * 📦 Interface du système de données (Data System).
 * Responsable de l'extraction des données brutes nécessaires à la génération du document.
 */
export interface DataSystem {
  /**
   * Récupère les données en fonction du nom de la requête et des paramètres fournis.
   * @param requestName Le nom de la requête à exécuter.
   * @param params Les paramètres de filtrage ou de sélection.
   */
  getData(requestName: string, params: unknown): DataSystemResult;
}

/**
 * ⚙️ Configuration nécessaire au service d'exportation.
 */
export interface DocumentServiceConfig {
  /** L'instance du système de données. */
  dataSystem: DataSystem;
}

/**
 * 🌐 Interface publique du service d'exportation de documents, adaptée aux API Electron.
 * Utilise des génériques pour une meilleure compatibilité avec l'interface `RouteHandler`.
 */
interface IDocumentExportService<TRes, TData, TParams extends object> {
  /** Route pour obtenir la liste des documents disponibles. */
  getDocumentInfos: () => RouteHandler<TRes, TData, TParams>;
  /** Route pour exporter un document spécifique. */
  exportDocument: () => RouteHandler<TRes, TData, TParams>;
}

/**
 * 🚀 Service principal d'exportation de documents.
 * Agit comme un conteneur et un coordinateur, déléguant la logique spécifique de génération
 * aux `DocumentHandler` enregistrés.
 */
export class DocumentExportService
  implements IDocumentExportService<any, DocumentFilter, {}>
{
  private documentToExport: Map<string, DocumentHandler> = new Map();
  private readonly documentInfos: DocumentInfo[] = [];
  private readonly configuration: DocumentServiceConfig;

  /**
   * @param documents Liste des gestionnaires de documents implémentant `DocumentHandler`.
   * @param configuration La configuration du service (notamment l'accès aux données).
   */
  constructor(
    documents: DocumentHandler[],
    configuration: DocumentServiceConfig
  ) {
    this.configuration = configuration;

    this.initDocumentHandlers(documents);
  }

  /**
   * 🏭 Initialise les cartes de référence des documents disponibles.
   * @param documents Les gestionnaires de documents à enregistrer.
   */
  private initDocumentHandlers(documents: DocumentHandler[]): void {
    for (const doc of documents) {
      const key = doc.getKey();
      this.documentToExport.set(key, doc);
      this.documentInfos.push({
        key,
        type: doc.getType(),
        title: doc.getTitle(),
        description: doc.getDescription(),
      });
    }
  }

  /**
   * 🔎 Récupère un gestionnaire de document par sa clé.
   * @param documentKey Clé du document.
   */
  private getDocumentHandler(documentKey: string): DocumentHandler | undefined {
    return this.documentToExport.get(documentKey);
  }

  /**
   * 📤 Endpoint pour obtenir les informations sur les documents exportables.
   * @returns Une réponse contenant un tableau de `DocumentInfo`.
   */
  public getDocumentInfos() {
    return async ({}) => {
      return response(this.documentInfos);
    };
  }

  /**
   * ⚙️ Traite les étapes de l'exportation du document (Validation, Extraction des données, Traitement, Sauvegarde).
   * C'est le cœur de la logique métier.
   *
   * @param handler Le gestionnaire de document sélectionné.
   * @param documentParams Les paramètres de filtrage pour le document.
   */
  private async processExport(
    handler: DocumentHandler,
    documentParams: unknown
  ): Promise<ReturnType<typeof response>> {
    // 1. Validation des paramètres
    const validationResult = handler.validate(documentParams);
    if (!validationResult.success) {
      // ⚠️ Mauvaise requête (paramètres invalides)
      return response(
        {
          message:
            "Les paramètres fournis sont invalides pour ce type de document. Veuillez vérifier les données envoyées.",
          details: validationResult.message, // Ajout du message de validation si disponible
        },
        Status.BAD_REQUEST
      );
    }

    // 2. Extraction des données brutes
    const requestName = handler.getRequestName();
    const dataExtraction = this.configuration.dataSystem.getData(
      requestName,
      documentParams
    );

    if (!dataExtraction.success) {
      // ⚠️ Erreur lors de l'extraction des données
      return response(
        {
          message: `Échec de l'extraction des données (${requestName}).`,
          details: dataExtraction.errorMessage,
        },
        Status.INTERNAL_SERVER
      );
    }

    // 3. Traitement du document (Génération du contenu)
    const documentProcess = await handler.processHandle(dataExtraction.data);

    if (!documentProcess.success) {
      // ⚠️ Erreur lors de la génération du contenu du document
      return response(
        {
          message:
            "Une erreur est survenue lors de la génération du contenu du document.",
          details: documentProcess.errorMessage,
        },
        Status.INTERNAL_SERVER
      );
    }

    const { data: fileData, options: fileOptions } = documentProcess.result;

    // 4. Sauvegarde du fichier via la boîte de dialogue (Opération Electron)
    const filenamePath = await saveFileWithDialog(fileData, fileOptions);

    // 5. Envoi de la réponse à l'application
    if (filenamePath) {
      // ✅ Succès : Le fichier a été sauvegardé
      return response({
        filenamePath,
        message: "Document exporté avec succès.",
      });
    }

    // ⛔ Annulation par l'utilisateur
    return response(
      { message: "Opération de sauvegarde annulée par l'utilisateur." },
      Status.CLIENT_ERROR // Code 499 - Client Closed Request ou 400 selon l'API. Utilisons BAD_REQUEST ou un code custom.
    );
  }

  /**
   * 📤 Endpoint pour l'exportation effective du document.
   * @param payload La charge utile de la requête, contenant `documentType` et les paramètres.
   */
  public exportDocument() {
    return async ({
      data: { documentType, ...documentParams },
    }: {
      data: DocumentFilter;
    }) => {
      console.log("exportDocument ", documentParams);
      const handler = this.getDocumentHandler(documentType);

      if (!handler) {
        // ⚠️ Document non trouvé
        return response(
          {
            message: `Le type de document '${documentType}' n'est pas implémenté ou n'existe pas.`,
          },
          Status.NOT_FOUND
        );
      }

      try {
        return await this.processExport(handler, documentParams);
      } catch (error) {
        // 🛑 Gestion des erreurs non capturées (erreurs inattendues)
        console.error(
          "Erreur critique lors de l'exportation du document:",
          error
        );
        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        return response(
          {
            error: errorMessage,
            message:
              "Une erreur système inattendue s'est produite lors de l'exportation.",
          },
          Status.INTERNAL_SERVER
        );
      }
    };
  }
}
