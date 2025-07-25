import { Model, ModelAttributes, DataTypes } from "sequelize";
import ShortUniqueId from "short-unique-id";

const shortId = new ShortUniqueId({ length: 5 });

export interface IBaseModel {
  id: string;
  createAt: Date;
  updateAt: Date;
}

export const baseModel: ModelAttributes<Model<IBaseModel, IBaseModel>> = {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    unique: true,
    allowNull: true,
    defaultValue: () => shortId.randomUUID(),
  },
};
