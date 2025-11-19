/**
 * 💡 Type de la fonction de traitement (Handler) d'une requête de données.
 * Cette fonction est responsable de l'accès et de l'extraction des données brutes.
 * Elle ne doit pas générer d'erreurs (throw) mais retourner les données ou gérer l'échec en interne si possible.
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
 * Utilise un type discriminant pour garantir la gestion explicite du succès ou de l'échec.
 */
export type DataSystemResult =
  | { success: true; data: unknown }
  | { success: false; errorMessage: string };

/**
 * 📦 Interface du système de données (Data System).
 * Responsable de l'extraction des données brutes nécessaires à la génération du document.
 * C'est le point d'entrée pour toute requête de données nommée.
 */
export interface IDataSystem {
  /**
   * Récupère les données en fonction du nom de la requête et des paramètres fournis.
   * @param requestName Le nom de la requête à exécuter.
   * @param params Les paramètres de filtrage ou de sélection.
   * @returns Un objet `DataSystemResult` indiquant le succès et les données, ou l'échec et le message d'erreur.
   */
  getData(requestName: string, params: unknown): DataSystemResult;
}

/**
 * 🚀 Implémentation concrète du service de données d'application.
 * Il agit comme un **Registry** qui mappe les noms de requêtes aux fonctions de traitement (handlers) correspondantes.
 * Cela permet de centraliser et de découpler la logique d'accès aux données.
 */
export class AppDataSystem implements IDataSystem {
  /**
   * Mappage des noms de requêtes vers leurs fonctions de traitement (Handlers).
   * L'utilisation de `Map` est préférable aux objets `{}` pour les registres de ce type en TypeScript.
   */
  private readonly requestHandlers: Map<string, DataRequestHandler>;

  /**
   * @param handlers Configuration de toutes les requêtes de données disponibles dans le système.
   */
  constructor(handlers: DataSystemHandler[]) {
    // Initialisation du registre des handlers
    this.requestHandlers = new Map(
      handlers.map((item) => [item.requestName, item.handler])
    );
  }

  /**
   * Récupère les données brutes en exécutant le handler de requête correspondant.
   * @param requestName Le nom unique de la requête à exécuter.
   * @param params Les paramètres de la requête.
   * @returns Le résultat de l'exécution (données ou erreur).
   */
  public getData(requestName: string, params: unknown): DataSystemResult {
    const handler = this.requestHandlers.get(requestName);

    // 1. Vérification de l'existence du Handler
    if (!handler) {
      console.warn(
        `[DataSystem] ⚠️ Requête non reconnue. Échec de la récupération des données: ${requestName}`
      );
      return {
        success: false,
        errorMessage: `Requête non reconnue: '${requestName}'. Veuillez vérifier la configuration du DataSystem.`,
      };
    }

    // 2. Exécution du Handler avec gestion des exceptions (Guard)
    try {
      // Le handler est exécuté et est supposé retourner les données brutes.
      const data = handler(params);

      console.info(
        `[DataSystem] ✅ Données récupérées avec succès pour: ${requestName}`
      );
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      // 3. Gestion des erreurs d'exécution (si le handler throw)
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(
        `[DataSystem] ❌ Erreur lors de l'exécution du handler '${requestName}':`,
        error
      );

      return {
        success: false,
        errorMessage: `Erreur d'exécution du handler: ${requestName}. Détails: ${errorMessage}`,
      };
    }
  }
}
