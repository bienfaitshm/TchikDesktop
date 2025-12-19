/**
 * @file query-handler.ts
 * @description Classe abstraite de base pour les gestionnaires d'accès aux données (Query Handlers).
 * Fournit un pipeline standardisé pour la validation Zod, l'exécution DB, le mapping et le logging des performances.
 */

import { z } from "zod";
import { CustomLogger, getLogger } from "@/packages/logger";

/**
 * Type de retour standardisé pour toutes les opérations d'accès aux données.
 * Harmonisé avec le pattern 'Result' des autres services.
 * @template TPayload - Le type de données en cas de succès.
 */
export type DataAccessResult<TPayload> =
  | { success: true; payload: TPayload }
  | {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };

// ==========================================
// 2. Interfaces (Contrat du Handler)
// ==========================================

/**
 * Contrat pour un gestionnaire de requête de données.
 * @template TSchema - Schéma Zod définissant les paramètres d'entrée.
 * @template TPlainPayload - Type de données simples (POJO ou POJO[]) retourné.
 */
export interface IQueryHandler<TSchema> {
  readonly queryId: string;
  readonly schema: z.ZodSchema<TSchema>;
  readonly logger?: CustomLogger;

  /**
   * Valide les paramètres bruts contre le schéma Zod.
   */
  validate(rawParams: unknown): DataAccessResult<TSchema>;

  /**
   * Exécute la logique d'accès à la base de données (e.g., Sequelize.findAll).
   */
  execute<T>(validatedParams: TSchema): Promise<T | T[]>;

  /**
   * Point d'entrée principal du pipeline de requête.
   */
  handle<T>(rawParams: unknown): Promise<DataAccessResult<T>>;
}

// ==========================================
// 3. Abstract Implementation
// ==========================================

/**
 * Classe abstraite de base pour les gestionnaires de requêtes.
 * Fournit l'implémentation standard pour la validation, le mapping et le pipeline d'exécution.
 * @template TSchema - Schéma Zod.
 */
export abstract class AbstractQueryHandler<TSchema>
  implements IQueryHandler<TSchema>
{
  public abstract readonly queryId: string;
  public abstract readonly schema: z.ZodSchema<TSchema>;

  getLogger() {
    return getLogger(`Query:${this.queryId}`);
  }
  /** Logger injecté ou créé pour cette requête spécifique. */

  // Méthodes abstraites
  public abstract execute<T>(validatedParams: TSchema): Promise<T[]>;

  /**
   * @inheritdoc
   * Implémentation de la validation des paramètres Zod avec gestion des erreurs structurées.
   */
  public validate(rawParams: unknown): DataAccessResult<TSchema> {
    const result = this.schema.safeParse(rawParams);

    if (result.success) {
      return { success: true, payload: result.data as TSchema };
    }

    const errors = result.error.errors;
    const errorMessage = errors
      .map((err) => `[${err.path.join(".")}] ${err.message}`)
      .join(" | ");

    return {
      success: false,
      error: {
        code: "QUERY_PARAMS_VALIDATION_FAILED",
        message: `Validation failed for '${this.queryId}': ${errorMessage}`,
        details: errors,
      },
    };
  }

  /**
   * Nettoyage ou transformation finale des données avant l'envoi.
   * Cette méthode peut être surchargée par les classes filles.
   */
  protected transformPayload<T>(data: unknown): T {
    return data as T;
  }

  /**
   * @inheritdoc
   * Méthode principale orchestrant le pipeline d'exécution.
   */
  public async handle<T>(rawParams: unknown): Promise<DataAccessResult<T>> {
    const startTime = process.hrtime.bigint();
    const log = this.getLogger();
    let validatedParams: TSchema | undefined;

    log.info(`[${this.queryId}] Starting query execution.`, { rawParams });

    // 1. Validation des paramètres
    const validationResult = this.validate(rawParams);
    if (!validationResult.success) {
      log.warn(`[${this.queryId}] Parameter validation failed.`, {
        error: validationResult.error,
      });
      return validationResult as DataAccessResult<T>;
    }
    validatedParams = validationResult.payload;

    try {
      // 2. Exécution de la requête DB
      const models = await this.execute(validatedParams);

      // Décompte des résultats (avant le mapping)
      const isArray = Array.isArray(models);
      const resultCount = isArray ? models.length : models ? 1 : 0;

      // Gérer le cas où aucun résultat n'est trouvé
      if (!models || resultCount === 0) {
        log.info(`[${this.queryId}] No results found.`, {
          params: validatedParams,
        });

        // Retourner un succès avec un payload vide ([] ou null) est souvent préférable pour une Query.
        const emptyPayload: any = isArray ? [] : null;
        return { success: true, payload: emptyPayload };
      }
      const finalPayload = this.transformPayload(models) as T;

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;

      // 4. Log: Succès avec le temps d'exécution
      log.info(`[${this.queryId}] Query executed successfully.`, {
        durationMs: durationMs.toFixed(2),
        count: resultCount,
      });

      return { success: true, payload: finalPayload };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;

      const err = error instanceof Error ? error : new Error(String(error));

      // 5. Log: Erreur Système (Error)
      log.error(
        `[${this.queryId}] Unexpected system error during execution.`,
        err,
        {
          durationMs: durationMs.toFixed(2),
          message: err.message,
          stack: err.stack,
          params: validatedParams,
        }
      );

      return {
        success: false,
        error: {
          code: "INTERNAL_QUERY_ERROR",
          message: `An unexpected error occurred during the execution of '${this.queryId}'.`,
          details: err.message,
        },
      };
    }
  }
}
