import type { Model } from "sequelize";
import ShortUniqueId, { ShortUniqueIdOptions } from "short-unique-id";

/** Configuration pour les identifiants courts (alphanumérique par défaut) */
const BASE_ID_CONFIG: Partial<ShortUniqueIdOptions> = { length: 5 };

/** Configuration pour les codes (uniquement numérique pour des codes d'inscription) */
const NUMERIC_CODE_CONFIG: Partial<ShortUniqueIdOptions> = {
  length: 10,
  dictionary: "number",
};

const _baseIdGenerator = new ShortUniqueId(BASE_ID_CONFIG);
const _numericCodeGenerator = new ShortUniqueId(NUMERIC_CODE_CONFIG);

/**
 * Génère un identifiant court, aléatoire et unique (alphanumérique mixte).
 * * @param length La longueur souhaitée de l'identifiant. Par défaut: 5.
 * @returns L'identifiant généré.
 */
export function generateShortId(length?: number): string {
  // Utilise l'instance _baseIdGenerator configurée pour l'alphanumérique
  return _baseIdGenerator.randomUUID(length);
}

/**
 * Génère un nom d'utilisateur provisoire/temporaire basé sur un identifiant court.
 * * @param length La longueur souhaitée pour l'ID. Par défaut: 6.
 * @returns Le nom d'utilisateur provisoire.
 */
export function generateProvisionalUsername(length: number = 6): string {
  // Dans ce cas, l'implémentation est identique à generateShortId, mais le nom
  // reflète son usage métier (Username vs ID).
  const id = _baseIdGenerator.randomUUID(length);
  return id;
}

/**
 * Génère un code d'inscription (Enrollment Code) purement numérique et unique.
 * * @param length La longueur souhaitée du code. Par défaut: 10.
 * @returns Le code d'inscription numérique généré.
 */
export function generateNumericEnrollmentCode(length: number = 10): string {
  // Utilise l'instance _numericCodeGenerator qui utilise un dictionnaire restreint aux chiffres
  return _numericCodeGenerator.randomUUID(length);
}

const shortId = new ShortUniqueId({ length: 5 });
const shortCode = new ShortUniqueId({ length: 10, dictionary: "number" });

export function getUniqueId(lenght: number) {
  return shortId.randomUUID(lenght);
}

export function getDefaultUsername(lenght = 6): string {
  const id = shortId.randomUUID(lenght);
  return `${id}`;
}

export function getDefaultEnrolementCode(lenght = 10) {
  return shortCode.randomUUID(lenght);
}

/**TODO: delete
 * Transforms a promise resolving to an array of Sequelize models into
 * an array of plain JavaScript objects.
 *
 * @param data - A promise that resolves to an array of Sequelize Model instances.
 * @returns A promise that resolves to an array of plain objects.
 */
export async function mapModelsToPlainList<T extends Model>(
  data: Promise<T[]> | T[],
  callback?: (e: T) => unknown
): Promise<Record<string, any>[]> {
  const models = await data;
  const _func = callback ? callback : (model) => model?.toJSON?.() || model;
  return models.map(_func);
}

/**
 * TODO: delete
 * Transforms a promise resolving to a single Sequelize model into
 * a plain JavaScript object.
 *
 * @param data - A promise that resolves to a Sequelize Model instance.
 * @returns A promise that resolves to a plain object.
 */
export async function mapModelToPlain<T extends Model>(
  data: Promise<T> | T
): Promise<Record<string, any>> {
  const model = await data;
  return model?.toJSON?.() || model;
}

/**TODO: delete
 * @description Filtre un objet pour ne garder que les attributs dont la valeur est définie (pas 'undefined').
 * @param obj L'objet à filtrer.
 * @returns Un nouvel objet contenant seulement les clés avec des valeurs définies.
 */
export function getDefinedAttributes<T extends {} = {}>(
  obj: Partial<T>
): Partial<T> {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return {};
  }

  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {} as T);
}

/**
 * A generic type representing a plain JavaScript object.
 * Using 'unknown' is safer than 'any' in strict TypeScript environments.
 */
export type PlainObject = Record<string, unknown>;

/**
 * Resolves a Promise (or value) of Sequelize models into an array of plain objects.
 * * Features:
 * - Null-safe: Returns an empty array if input is null/undefined.
 * - Flexible: Accepts both Promises and direct values.
 * - Custom Mapping: Supports an optional transformation strategy.
 *
 * @template T - The Sequelize Model type.
 * @template R - The return type, defaults to PlainObject.
 * * @param dataOrPromise - A generic array of models or a promise resolving to one.
 * @param transformer - Optional function to transform each model. Defaults to `.toJSON()`.
 * * @returns A promise resolving to an array of plain objects (or type R).
 * * @example
 * const users = await resolveToPlainList(User.findAll());
 */
export async function resolveToPlainList<T extends Model, R = PlainObject>(
  dataOrPromise: T[] | Promise<T[]> | null | undefined,
  transformer?: (model: T) => R
): Promise<R[]> {
  // 1. Await the data regardless of whether it's a promise or value
  const models = await dataOrPromise;

  // 2. Guard clause: fail fast and safely if data is missing
  if (!models || !Array.isArray(models)) {
    return [];
  }

  // 3. Define the mapping strategy
  // Default strategy uses Sequelize's .toJSON(), falling back to the object itself.
  const mapFn =
    transformer ??
    ((model: T) => (model.toJSON ? model.toJSON() : model) as unknown as R);

  // 4. Execution
  return models.map(mapFn);
}

/**
 * Resolves a Promise (or value) of a single Sequelize model into a plain object.
 *
 * @template T - The Sequelize Model type.
 * @template R - The return type, defaults to PlainObject.
 * * @param dataOrPromise - A model instance or a promise resolving to one.
 * @returns A promise resolving to a plain object, or null if input is null.
 */
export async function resolveToPlain<T extends Model, R = PlainObject>(
  dataOrPromise: T | Promise<T> | null | undefined
): Promise<R | null> {
  const model = await dataOrPromise;

  if (!model) {
    return null;
  }

  return (model.toJSON ? model.toJSON() : model) as unknown as R;
}

/**
 * Creates a shallow copy of the object, discarding any properties that are `undefined`.
 * * * Note: This does not recursively filter nested objects (shallow only).
 * * Performance: Optimized to reduce intermediate allocations.
 *
 * @template T - The input object type.
 * @param obj - The source object to filter. Can be null or undefined.
 * @returns A new object with only defined properties.
 * * @example
 * const input = { a: 1, b: undefined, c: 3 };
 * const result = pruneUndefined(input);
 * // Result: { a: 1, c: 3 }
 */
export function pruneUndefined<T extends Record<string, unknown>>(
  obj: T | null | undefined
): Partial<T> {
  // 1. Guard Clause: strict checks for null, undefined, or arrays to avoid runtime crashes.
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return {};
  }

  // 2. Functional & Immutable Implementation
  // We iterate over keys to create a clean subset without mutating the original.
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];

    // 3. Strict check against undefined (null is usually considered a valid value in JSON APIs)
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T];
    }

    return acc;
  }, {} as Partial<T>);
}
