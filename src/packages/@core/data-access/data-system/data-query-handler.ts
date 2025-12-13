/**
 * @file data-query-handler.ts
 * @description Classe abstraite de base pour les gestionnaires d'accès aux données (Query Handlers).
 * Fournit un pipeline standardisé pour la validation Zod, l'exécution DB, le mapping et le logging des performances.
 */

import { z, type Schema } from "zod";
import { Model } from "sequelize";
import {
  resolveToPlain,
  resolveToPlainList,
} from "@/packages/@core/data-access/db";
import { CustomLogger, getLogger } from "@/main/libs/logger";

// ==========================================
// 1. Core Types & Utilities
// ==========================================

/** Représente une instance de modèle Sequelize typée pour la cohérence. */
type SequelizeInstance = Model;

/** Représente un objet JavaScript simple (POJO). */
type PlainObject = Record<string, unknown>;

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
export interface IDataQueryHandler<
  TSchema extends Schema,
  TPlainPayload extends PlainObject | PlainObject[],
> {
  readonly queryId: string;
  readonly schema: TSchema;
  readonly logger?: CustomLogger;

  /**
   * Valide les paramètres bruts contre le schéma Zod.
   */
  validate(rawParams: unknown): DataAccessResult<z.infer<TSchema>>;

  /**
   * Exécute la logique d'accès à la base de données (e.g., Sequelize.findAll).
   */
  execute(
    validatedParams: z.infer<TSchema>
  ): Promise<SequelizeInstance | SequelizeInstance[]>;

  /**
   * Convertit les instances ORM en objets JavaScript simples (POJO).
   */
  mapToPlain(
    models: SequelizeInstance | SequelizeInstance[]
  ): Promise<TPlainPayload>;

  /**
   * Point d'entrée principal du pipeline de requête.
   */
  handle(rawParams: unknown): Promise<DataAccessResult<TPlainPayload>>;
}

// ==========================================
// 3. Abstract Implementation
// ==========================================

/**
 * Classe abstraite de base pour les gestionnaires de requêtes.
 * Fournit l'implémentation standard pour la validation, le mapping et le pipeline d'exécution.
 * @template TSchema - Schéma Zod.
 * @template TPlainPayload - Type de données simples retourné.
 */
export abstract class AbstractDataQueryHandler<
  TSchema extends Schema = z.ZodSchema<any>,
  TPlainPayload extends PlainObject | PlainObject[] = any,
> implements IDataQueryHandler<TSchema, TPlainPayload>
{
  public abstract readonly queryId: string;
  public abstract readonly schema: TSchema;

  getLogger() {
    return getLogger(`Query:${this.queryId}`);
  }
  /** Logger injecté ou créé pour cette requête spécifique. */

  // Méthodes abstraites
  public abstract execute(
    validatedParams: z.infer<TSchema>
  ): Promise<SequelizeInstance | SequelizeInstance[]>;

  /**
   * @inheritdoc
   * Implémentation de la validation des paramètres Zod avec gestion des erreurs structurées.
   */
  public validate(rawParams: unknown): DataAccessResult<z.infer<TSchema>> {
    const result = this.schema.safeParse(rawParams);

    if (result.success) {
      return { success: true, payload: result.data as z.infer<TSchema> };
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
   * @inheritdoc
   * Convertit les instances ORM en objets JavaScript simples (POJO).
   */
  public async mapToPlain(
    models: SequelizeInstance | SequelizeInstance[]
  ): Promise<TPlainPayload> {
    if (Array.isArray(models)) {
      // Nettoyage sécurisé pour la liste
      return resolveToPlainList(models) as unknown as TPlainPayload;
    }
    // Nettoyage sécurisé pour un seul modèle
    return resolveToPlain(models) as unknown as TPlainPayload;
  }

  /**
   * Nettoyage ou transformation finale des données avant l'envoi.
   * Cette méthode peut être surchargée par les classes filles.
   */
  protected transformPayload(data: TPlainPayload): TPlainPayload {
    return data;
  }

  /**
   * @inheritdoc
   * Méthode principale orchestrant le pipeline d'exécution.
   */
  public async handle(
    rawParams: unknown
  ): Promise<DataAccessResult<TPlainPayload>> {
    const startTime = process.hrtime.bigint();
    const log = this.getLogger();
    let validatedParams: z.infer<TSchema> | undefined;

    log.info(`[${this.queryId}] Starting query execution.`, { rawParams });

    // 1. Validation des paramètres
    const validationResult = this.validate(rawParams);
    if (!validationResult.success) {
      log.warn(`[${this.queryId}] Parameter validation failed.`, {
        error: validationResult.error,
      });
      return validationResult as DataAccessResult<TPlainPayload>;
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

      // 3. Mapping et Transformation des données
      const rawPayload = await this.mapToPlain(models);
      const finalPayload = this.transformPayload(rawPayload);

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
