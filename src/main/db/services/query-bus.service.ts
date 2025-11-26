/**
 * @file query-bus.service.ts
 * @description Implémentation du service de médiation pour l'exécution des requêtes de données.
 * Agit comme un Bus de Requêtes, routant les appels vers les gestionnaires (Handlers) appropriés.
 */

import { getLogger, CustomLogger } from "@/main/libs/logger";
import {
  AbstractDataQueryHandler,
  DataAccessResult,
} from "./handlers/data-query-handler"; // Importer les types refactorisés

// ==========================================
// 1. Core Types & Interfaces (Alignées sur le standard)
// ==========================================

/**
 * 📦 Interface du Bus de Requêtes (Data Mediator).
 * @template TPayload Le type de donnée simple retourné.
 */
export interface IQueryBus {
  /**
   * Exécute la requête spécifiée en la routant vers le Handler enregistré.
   * @param queryId Nom unique de la requête (clé pour l'accès).
   * @param params Les paramètres de filtrage/sélection bruts.
   */
  execute<TPayload = unknown>(
    queryId: string,
    params: unknown
  ): Promise<DataAccessResult<TPayload>>;
}

// Nous n'utilisons plus DataSystemHandler ou DataRequestHandler car l'interface
// IDataQueryHandler est plus robuste et gère la validation/exécution/mapping.
// Les types DataSystemResult ne sont plus nécessaires, remplacés par DataAccessResult.

// ==========================================
// 2. Service Implementation (Query Bus)
// ==========================================

/**
 * 🚀 Implémentation concrète du Bus de Requêtes.
 * Gère l'enregistrement et l'exécution des Data Query Handlers.
 */
export class DataQueryBus implements IQueryBus {
  // Le Map stocke les handlers sous leur identifiant unique
  private readonly handlerRegistry: Map<string, AbstractDataQueryHandler> =
    new Map();

  // Logger dédié pour le système de médiation
  private readonly logger: CustomLogger = getLogger("QueryBus");

  /**
   * @param handlers Liste des gestionnaires de requêtes (stratégies) à enregistrer.
   */
  constructor(handlers: AbstractDataQueryHandler[]) {
    // Construction du registre: Map<queryId, handler>
    for (const handler of handlers) {
      if (this.handlerRegistry.has(handler.queryId)) {
        this.logger.warn(
          `Duplicate queryId registered: ${handler.queryId}. Overwriting.`
        );
      }
      this.handlerRegistry.set(handler.queryId, handler);
    }
    this.logger.info(
      `Initialized with ${this.handlerRegistry.size} handler(s).`
    );
  }

  /**
   * @inheritdoc
   * Exécute une requête en la déléguant au Query Handler approprié.
   */
  public async execute<TPayload = unknown>(
    queryId: string,
    params: unknown
  ): Promise<DataAccessResult<TPayload>> {
    // Récupérer le Handler
    const handler = this.handlerRegistry.get(queryId);

    // 1. Vérification de l'existence du Handler (Non Trouvé)
    if (!handler) {
      this.logger.warn(`Unrecognized query ID. Execution failed.`, {
        queryId,
        params,
      });

      return {
        success: false,
        error: {
          code: "QUERY_NOT_FOUND",
          message: `Unrecognized query handler: '${queryId}'. Verify the Query Bus configuration.`,
        },
      } as DataAccessResult<TPayload>; // Cast pour aligner le type de retour
    }

    // 2. Exécution du Handler
    this.logger.info(`Executing handler: ${queryId}`, { params });

    try {
      // Le handler.handle() exécute tout le pipeline (Validation, DB, Mapping)
      // et retourne déjà le type DataAccessResult<T>
      const result = await handler.handle(params);

      // On utilise l'opérateur 'as' pour forcer le type TPayload.
      // C'est un point de confiance architecturale : le handler enregistré doit
      // retourner le type attendu par le consommateur.
      return result as DataAccessResult<TPayload>;
    } catch (error) {
      // 3. Gestion des erreurs d'exécution inattendues (très rare si le handler est bien fait)
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Critical runtime error during handler execution.`,
        err,
        { queryId, params }
      );

      return {
        success: false,
        error: {
          code: "RUNTIME_EXECUTION_ERROR",
          message: `A critical error occurred while executing handler: ${queryId}.`,
          details: err.message,
        },
      } as DataAccessResult<TPayload>;
    }
  }
}
