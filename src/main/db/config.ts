import "dotenv/config";
import { Sequelize } from "sequelize";

export const DEFAULT_DB_FILENAME = "./database.sqlite";

const config = {
  dialect: "sqlite",
  storage: DEFAULT_DB_FILENAME,
};

export const sequelize = new Sequelize(config as any);
