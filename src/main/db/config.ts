import "dotenv/config";
import { Sequelize } from "sequelize";

export const DEFAULT_DB_FILENAME = "database.sqlite";
export const SCHEMA_STATUS_FILE = "./schema_sync_status.json";

export const sequelize = new Sequelize(DEFAULT_DB_FILENAME);
