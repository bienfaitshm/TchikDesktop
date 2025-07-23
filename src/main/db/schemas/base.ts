import { Model, ModelAttributes, DataTypes } from "sequelize";
import ShortUniqueId from "short-unique-id";

const shortId = new ShortUniqueId({ length: 5 });

export const modelBase: ModelAttributes<Model<any, any>> = {
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    unique: true,
    allowNull: true,
    defaultValue: () => shortId.randomUUID(),
  },
};
