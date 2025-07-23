import { DataTypes } from "sequelize";
import { sequelize } from "@/main/db/config";
import { modelBase } from "./base";

export const User = sequelize.define("users", {
  ...modelBase,
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
  },
});
