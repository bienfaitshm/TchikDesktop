import {
  Model,
  ModelAttributes,
  DataTypes,
  BuildOptions,
  ModelAttributeColumnOptions,
} from "sequelize";
import { getUniqueId } from "./utils";

export type ModelStatic<
  Attributes extends {},
  InsertAttributes extends {} = {},
> = typeof Model & {
  new (
    values?: object,
    options?: BuildOptions
  ): Model<Attributes, InsertAttributes> & Attributes;
};

export const PRIMARY_KEY = {
  type: DataTypes.STRING(10),
  primaryKey: true,
  unique: true,
  allowNull: true,
  defaultValue: getUniqueId,
};

export interface IBaseModel {
  id: string;
  createAt: Date;
  updateAt: Date;
}

export const baseModel: ModelAttributes<Model<IBaseModel, IBaseModel>> = {
  id: {
    ...PRIMARY_KEY,
  },
};

export function primaryKey<M extends Model = Model<any, any>>(
  value: Partial<ModelAttributeColumnOptions<M>>
): ModelAttributeColumnOptions<M> {
  return { ...PRIMARY_KEY, ...value };
}
