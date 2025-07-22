import { DataTypes } from "sequelize";
import { sequelize } from "@/main/db/config";

export const User = sequelize.define("users", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
  },
});
