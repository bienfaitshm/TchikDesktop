import { response } from "@/commons/libs/electron-apis/utils";
import { SaveFileOptions, saveFileWithDialog } from "@/main/libs/save-files";
import { Status } from "@/commons/libs/electron-apis/constant";
import type { RouteHandler } from "@/commons/libs/electron-apis/server";
import { DocumentFilter } from "@/commons/types/services";
import { CustomLogger, getLogger } from "@/main/libs/logger";
import { getProcessedDocumentOptions } from "./utils";
import { DocumentInfo } from "@/commons/types/services.documents";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";

export type DocumentGenerationResult = {
  data: any;
  options: SaveFileOptions;
};

export type ValidationResult =
  | { success: true; data: unknown }
  | { success: false; message: string };
export type ProcessHandleResult =
  | { success: true; result: DocumentGenerationResult }
  | { success: false; errorMessage: string };
export type DataSystemResult =
  | { success: true; data: unknown }
  | { success: false; errorMessage: string };
export type TApiHandler<
  TRes,
  TData,
  TParams extends {} = {},
> = () => RouteHandler<TRes, TData, TParams>;
export interface DocumentHandler {
  getKey(): string;
  getType(): DOCUMENT_EXTENSION;
  getTitle(): string;
  getDescription(): string;
  validate(params: unknown): ValidationResult;
  getRequestName(): string;
  processHandle(data: unknown): Promise<ProcessHandleResult>;
}
export interface DataSystem {
  getData(requestName: string, params: unknown): Promise<DataSystemResult>;
}
export interface DocumentServiceConfig {
  dataSystem: DataSystem;
}
interface IDocumentExportService<TRes, TData, TParams extends object> {
  getDocumentInfos: () => RouteHandler<TRes, TData, TParams>;
  exportDocument: () => RouteHandler<TRes, TData, TParams>;
}

/**
 * 🚀 Service principal d'exportation de documents.
 * Intègre un logger professionnel (via getLogger) pour suivre toutes les étapes.
 */
export class DocumentExportService
  implements IDocumentExportService<any, DocumentFilter, {}>
{
  private documentToExport: Map<string, DocumentHandler> = new Map();
  private readonly documentInfos: DocumentInfo[] = [];
  private readonly configuration: DocumentServiceConfig;

  // 🆕 Logger dédié pour le service
  private readonly logger: CustomLogger = getLogger("DocumentExportService");

  constructor(
    documents: DocumentHandler[],
    configuration: DocumentServiceConfig
  ) {
    this.configuration = configuration;
    this.logger.info("Démarrage du DocumentExportService.");
    this.initDocumentHandlers(documents);
  }

  /**
   * 🏭 Initialise les gestionnaires de documents.
   */
  private initDocumentHandlers(documents: DocumentHandler[]): void {
    this.logger.info(
      `Initialisation de ${documents.length} gestionnaire(s) de document.`
    );
    for (const doc of documents) {
      const key = doc.getKey();
      this.documentToExport.set(key, doc);
      this.documentInfos.push({
        key,
        type: doc.getType(),
        title: doc.getTitle(),
        description: doc.getDescription(),
      });
      this.logger.info(`Gestionnaire enregistré : ${key} (${doc.getTitle()})`);
    }
  }

  private getDocumentHandler(documentKey: string): DocumentHandler | undefined {
    return this.documentToExport.get(documentKey);
  }

  /**
   * 📤 Endpoint pour obtenir les informations sur les documents exportables.
   */
  public getDocumentInfos(): RouteHandler<
    unknown,
    unknown,
    { format?: "grouped" | "mapped" }
  > {
    return async ({ params }) => {
      this.logger.info("API: Demande de liste des documents exportables.");
      if (params?.format === "grouped") {
        return response(getProcessedDocumentOptions(this.documentInfos));
      }
      return response(this.documentInfos);
    };
  }

  /**
   * ⚙️ Traite les étapes de l'exportation du document (Validation, Extraction, Traitement, Sauvegarde).
   */
  private async processExport(
    handler: DocumentHandler,
    documentParams: unknown
  ): Promise<ReturnType<typeof response>> {
    const documentKey = handler.getKey();
    const processLogger = getLogger(`ExportProcess:${documentKey}`);

    processLogger.info(`Démarrage de l'exportation.`, {
      params: documentParams,
    });

    // 1. Validation des paramètres
    processLogger.info("Étape 1/5: Validation des paramètres.");
    const validationResult = handler.validate(documentParams);
    if (!validationResult.success) {
      processLogger.warn("Étape 1/5: Échec de la validation.", {
        error: validationResult.message,
      });
      return response(
        {
          message:
            "Les paramètres fournis sont invalides pour ce type de document. Veuillez vérifier les données envoyées.",
          details: validationResult.message,
        },
        Status.BAD_REQUEST
      );
    }
    processLogger.info("Étape 1/5: Validation réussie.");

    // 2. Extraction des données brutes
    const requestName = handler.getRequestName();
    processLogger.info(
      `Étape 2/5: Extraction des données (Requête: ${requestName}).`
    );

    const dataExtraction = await this.configuration.dataSystem.getData(
      requestName,
      documentParams
    );

    if (!dataExtraction.success) {
      processLogger.error(
        "Étape 2/5: Échec de l'extraction des données.",
        dataExtraction.errorMessage,
        { request: requestName }
      );
      return response(
        {
          message: `Échec de l'extraction des données (${requestName}).`,
          details: dataExtraction.errorMessage,
        },
        Status.INTERNAL_SERVER
      );
    }
    processLogger.info("Étape 2/5: Extraction des données réussie.");

    // 3. Traitement du document (Génération du contenu)
    processLogger.info("Étape 3/5: Génération du contenu binaire.");
    const documentProcess = await handler.processHandle(dataExtraction.data);

    if (!documentProcess.success) {
      processLogger.error(
        "Étape 3/5: Échec de la génération du contenu.",
        documentProcess.errorMessage
      );
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
    processLogger.info(
      `Étape 3/5: Génération réussie. Fichier cible : ${fileOptions.defaultPath}.`
    );

    // 4. Sauvegarde du fichier via la boîte de dialogue (Opération Electron)
    processLogger.info(
      "Étape 4/5: Appel du dialogue de sauvegarde utilisateur (Electron)."
    );
    const filenamePath = await saveFileWithDialog(fileData, fileOptions);

    // 5. Finalisation et réponse
    if (filenamePath) {
      processLogger.info(
        `Étape 5/5: Succès. Document sauvegardé à : ${filenamePath}.`
      );
      return response({
        filenamePath,
        message: "Document exporté avec succès.",
      });
    }

    // ⛔ Annulation par l'utilisateur
    processLogger.warn("Étape 5/5: Opération annulée par l'utilisateur.");
    return response(
      { message: "Opération de sauvegarde annulée par l'utilisateur." },
      Status.CLIENT_ERROR // 499 Client Closed Request (ou un code adapté)
    );
  }

  /**
   * 📤 Endpoint pour l'exportation effective du document.
   */
  public exportDocument() {
    return async ({
      data: { documentType, ...documentParams },
    }: {
      data: DocumentFilter;
    }) => {
      this.logger.info(`API: Tentative d'exportation.`, { documentType });

      const handler = await this.getDocumentHandler(documentType);

      if (!handler) {
        this.logger.warn(`API: Échec. Document non trouvé.`, { documentType });
        return response(
          {
            message: `Le type de document '${documentType}' n'est pas implémenté ou n'existe pas.`,
          },
          Status.NOT_FOUND
        );
      }

      try {
        const result = await this.processExport(handler, documentParams);
        this.logger.info(
          `API: Exportation de '${documentType}' terminée avec le statut ${result.status}.`
        );
        return result;
      } catch (error) {
        this.logger.error(
          "Erreur critique inattendue lors de l'exportation.",
          error instanceof Error ? error : String(error)
        );
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error ?? "Erreur inconnue");
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
