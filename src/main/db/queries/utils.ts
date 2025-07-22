import type { Model } from "sequelize";

/**
 * Transforms a promise resolving to an array of Sequelize models into
 * an array of plain JavaScript objects.
 *
 * @param data - A promise that resolves to an array of Sequelize Model instances.
 * @returns A promise that resolves to an array of plain objects.
 */
export async function mapModelsToPlainList<T extends Model>(
  data: Promise<T[]>
): Promise<Record<string, any>[]> {
  const models = await data;
  return models.map((model) => model.toJSON());
}

/**
 * Transforms a promise resolving to a single Sequelize model into
 * a plain JavaScript object.
 *
 * @param data - A promise that resolves to a Sequelize Model instance.
 * @returns A promise that resolves to a plain object.
 */
export async function mapModelToPlain<T extends Model>(
  data: Promise<T>
): Promise<Record<string, any>> {
  const model = await data;
  return model.toJSON();
}
