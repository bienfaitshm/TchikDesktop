import type { Model } from "sequelize";
import ShortUniqueId from "short-unique-id";

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

/**
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
  const _func = callback ? callback : (model) => model.toJSON();
  return models.map(_func);
}

/**
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
  return model.toJSON();
}

/**
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
