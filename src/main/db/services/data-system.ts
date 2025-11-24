import { mapModelsToPlainList, mapModelToPlain } from "@/main/db/models/utils";
import { getLogger, CustomLogger } from "@/main/libs/logger";

/**
 * 💡 Type de la fonction de traitement (Handler) d'une requête de données.
 * @param params Les paramètres de filtrage ou de sélection de la requête.
 * @returns Les données brutes (non typées) résultant de l'exécution de la requête.
 */
export type DataRequestHandler = (params: unknown) => unknown;

/**
 * 🧱 Structure de configuration pour l'enregistrement d'un Data Handler.
 */
export interface DataSystemHandler {
  /** Nom unique de la requête (clé pour l'accès). */
  requestName: string;
  /** La fonction de traitement qui exécute la requête. */
  handler: DataRequestHandler;
}

/**
 * 💾 Résultat de l'appel au système de données.
 */
export type DataSystemResult =
  | { success: true; data: unknown }
  | { success: false; errorMessage: string };

/**
 * 📦 Interface du système de données (Data System).
 */
export interface IDataSystem {
  getData(requestName: string, params: unknown): Promise<DataSystemResult>;
}

/**
 * 🚀 Implémentation concrète du service de données d'application.
 */
export class AppDataSystem implements IDataSystem {
  private readonly requestHandlers: Map<string, DataRequestHandler>;
  // 🆕 Logger dédié pour le système de données
  private readonly logger: CustomLogger = getLogger("DataSystem");

  constructor(handlers: DataSystemHandler[]) {
    // Initialisation du registre des handlers
    this.requestHandlers = new Map(
      handlers.map((item) => [item.requestName, item.handler])
    );
    this.logger.info(
      `Initialisation du DataSystem avec ${handlers.length} handler(s).`
    );
  }

  /**
   * Récupère les données brutes en exécutant le handler de requête correspondant.
   */
  public async getData(
    requestName: string,
    params: unknown
  ): Promise<DataSystemResult> {
    const handler = this.requestHandlers.get(requestName);

    // 1. Vérification de l'existence du Handler
    if (!handler) {
      // ❌ Log d'avertissement pour les requêtes inconnues
      this.logger.warn(`Requête non reconnue. Échec de la récupération.`, {
        requestName,
        params,
      });

      return {
        success: false,
        errorMessage: `Requête non reconnue: '${requestName}'. Veuillez vérifier la configuration du DataSystem.`,
      };
    }

    // Log pour le début de l'exécution
    this.logger.info(`Exécution du handler: ${requestName}`, { params });

    // 2. Exécution du Handler avec gestion des exceptions (Guard)
    try {
      // Le handler est exécuté et est supposé retourner les données brutes.
      const _data = await handler(params);

      // Conversion des modèles de base de données en objets plain JavaScript
      const data = await (Array.isArray(_data)
        ? mapModelsToPlainList(_data)
        : mapModelToPlain(_data as any));

      // ✅ Log de succès
      this.logger.info(`Données récupérées avec succès.`, {
        requestName,
        dataType: Array.isArray(data) ? `Array[${data.length}]` : typeof data,
      });

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      // 3. Gestion des erreurs d'exécution (si le handler throw)
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // ❌ Log d'erreur détaillé
      this.logger.error(
        `Erreur lors de l'exécution du handler.`,
        error instanceof Error ? error : String(error),
        { requestName, params }
      );

      return {
        success: false,
        errorMessage: `Erreur d'exécution du handler: ${requestName}. Détails: ${errorMessage}`,
      };
    }
  }
}

/**
 * 🛠️ Crée un objet de configuration `DataSystemHandler`.
 * Cette fonction utilitaire facilite l'enregistrement des requêtes en s'assurant
 * que la structure de l'objet est correctement formée (clé-valeur).
 */
export function createDataSystemHandler(
  name: string,
  handler: DataRequestHandler
): DataSystemHandler {
  return {
    requestName: name,
    handler: handler,
  };
}
