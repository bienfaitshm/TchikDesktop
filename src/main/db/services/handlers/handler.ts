import { z, type Schema } from "zod";
import { Model } from "sequelize";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import { CustomLogger } from "@/main/libs/logger";

/**
 * @typedef {Model} SequelizeModel - Représente une instance de modèle Sequelize.
 */
type SequelizeModel = Model;

/**
 * @typedef {Record<string, any>} PlainData - Représente un objet JavaScript simple.
 */
type PlainData = Record<string, any>;

/**
 * @typedef {object} QueryError - Représente le résultat d'une opération en cas d'échec.
 */
type QueryError = {
  success: false;
  message: string;
  errors?: unknown;
};

/**
 * @typedef {object} QuerySuccess<TData> - Représente le résultat d'une opération en cas de succès.
 * @template TData
 */
type QuerySuccess<TData> = {
  success: true;
  data: TData;
};

/**
 * @typedef {QueryError | QuerySuccess<TData>} QueryResult<TData> - Type de retour standard
 * pour toutes les opérations de requête.
 * @template {PlainData | PlainData[]} TData - Le type de données en cas de succès.
 */
export type QueryResult<TData = PlainData> = QueryError | QuerySuccess<TData>;

/**
 * @interface IQueryHandler
 * @description Interface fondamentale pour un Query Handler.
 * @template {Schema} TSchema - L'objet Zod Schema définissant les paramètres d'entrée.
 * @template {PlainData | PlainData[]} TPlainData - Le type de données simples retourné.
 */
export interface IQueryHandler<
  TSchema extends Schema,
  TPlainData extends PlainData | PlainData[],
> {
  readonly queryName: string;
  readonly schema: TSchema;
  /**
   * @readonly
   * @type {CustomLogger | undefined} logger - Instance du logger pour la classe.
   */
  readonly logger?: CustomLogger;

  validateParams(rawParams: unknown): QueryResult<z.infer<TSchema> | undefined>;
  executeQueryset(
    validatedParams: z.infer<TSchema>
  ): Promise<SequelizeModel | SequelizeModel[]>;
  mapModelsToPlainData(
    models: SequelizeModel | SequelizeModel[]
  ): Promise<TPlainData>;
  handle(rawParams: unknown): Promise<QueryResult<TPlainData>>;
}

/**
 * @abstract
 * @class BaseQueryHandler
 * @description Classe abstraite de base pour tous les Query Handlers avec logging professionnel.
 * @template {Schema} [TSchema=any] - Schéma Zod définissant les paramètres d'entrée.
 * @template {PlainData | PlainData[]} [TPlainData=any] - Type de données simples retourné.
 */
export abstract class BaseQueryHandler<
  TSchema extends Schema = any,
  TPlainData extends PlainData | PlainData[] = any,
> implements IQueryHandler<TSchema, TPlainData>
{
  public abstract readonly queryName: string;
  public abstract readonly schema: TSchema;
  // Nous supposons que le logger est disponible via l'injection/propriété dans la classe concrète.
  public abstract readonly logger?: CustomLogger;

  /**
   * @method validateParams
   * @description Implémentation de la validation des paramètres en utilisant `this.schema.safeParse()`.
   * @inheritdoc
   */
  public validateParams(
    rawParams: unknown
  ): QueryResult<z.infer<TSchema> | undefined> {
    const result = this.schema.safeParse(rawParams);
    if (result.success) {
      return { success: true, data: result.data as z.infer<TSchema> };
    }

    const errors = result.error.errors;
    const errorMessage = errors
      .map((err) => `[${err.path.join(".")}] ${err.message}`)
      .join(" | ");

    return {
      success: false,
      errors,
      message: `Erreur de validation des paramètres pour '${this.queryName}': ${errorMessage}`,
    };
  }

  /**
   * cleanData
   */
  public async cleanData(data: Promise<TPlainData> | TPlainData) {
    return data;
  }

  /**
   * @method mapModelsToPlainData
   * @description Convertit les instances Sequelize en objets JavaScript simples.
   * @inheritdoc
   */
  public async mapModelsToPlainData(
    models: SequelizeModel | SequelizeModel[]
  ): Promise<TPlainData> {
    if (!Array.isArray(models) && models instanceof Model) {
      return mapModelToPlain(models) as unknown as TPlainData;
    }
    return mapModelsToPlainList(models) as unknown as TPlainData;
  }

  /**
   * @method executeQueryset
   * @description Méthode abstraite. Logique d'accès à la base de données.
   * @inheritdoc
   */
  public abstract executeQueryset(
    validatedParams: z.infer<TSchema>
  ): Promise<SequelizeModel | SequelizeModel[]>;

  /**
   * @method handle
   * @description La méthode principale pour exécuter la requête avec logging professionnel.
   * @inheritdoc
   */
  public async handle(rawParams: unknown): Promise<QueryResult<TPlainData>> {
    const startTime = process.hrtime.bigint();

    // 1. Log: Démarrage de l'exécution
    this.logger?.info(
      `[${this.queryName}] Démarrage de l'exécution de la requête.`,
      {
        rawParams: rawParams,
      }
    );

    // 2. Validation des paramètres
    const validationResult = this.validateParams(rawParams);

    if (!validationResult.success) {
      // Log: Échec de validation (Warn) - Problème côté client
      this.logger?.warn(
        `[${this.queryName}] Échec de la validation des paramètres.`,
        {
          errors: validationResult.errors,
        }
      );
      return validationResult as QueryResult<TPlainData>;
    }

    const validatedParams = validationResult.data as z.infer<TSchema>;

    try {
      // 3. Exécution de la requête DB
      const models = await this.executeQueryset(validatedParams);

      if (!models || (Array.isArray(models) && models.length === 0)) {
        // Log: Aucun résultat trouvé (Info)
        this.logger?.info(
          `[${this.queryName}] Aucun résultat retourné par le Queryset.`,
          {
            params: validatedParams,
          }
        );
        return {
          success: false,
          message: `Aucun résultat trouvé pour la requête '${this.queryName}'.`,
        };
      }

      // 4. Nettoyage des données
      const plainData = await this.cleanData(this.mapModelsToPlainData(models));

      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;

      // 5. Log: Succès (Info) avec le temps d'exécution et le décompte des résultats
      const resultCount = Array.isArray(models) ? models.length : 1;
      this.logger?.info(`[${this.queryName}] Requête terminée avec succès.`, {
        durationMs: durationMs.toFixed(2),
        count: resultCount,
      });

      return { success: true, data: plainData };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;

      // 6. Log: Erreur Système (Error) - Problème côté serveur/DB
      this.logger?.error(
        `[${this.queryName}] Erreur système inattendue. duree:${durationMs.toFixed(2)}, error: ${error}, parametre: ${validatedParams}`
      );

      return {
        success: false,
        errors: error,
        message: `Une erreur système est survenue lors de l'exécution de la requête '${this.queryName}'.`,
      };
    }
  }
}
