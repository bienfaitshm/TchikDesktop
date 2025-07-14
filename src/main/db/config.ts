import "dotenv/config";
import fs from "fs";
import path from "path";
import { pushSQLiteSchema } from "drizzle-kit/api";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import * as schema from "./schemas";

type SchemaSyncStatus = {
  synchronized: boolean;
  checkedAt: string;
};

export const DATABASE_FILENAME = "local_database.db";
export const SCHEMA_STATUS_FILE = "./schema_sync_status.json";

export const dbClient = createClient({
  url: process.env.DB_FILE_NAME || `file:${DATABASE_FILENAME}`,
});
export const db = drizzle({ client: dbClient });

export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Error applying migrations:", error);
  }
}

export async function synchronizeSchema() {
  try {
    const { apply } = await pushSQLiteSchema(schema, db);
    await apply();
    console.log("Schema synchronized with the database.");
  } catch (error) {
    console.error("Error synchronizing schema:", error);
  }
}

export async function isSchemaSynchronized(): Promise<boolean> {
  if (fs.existsSync(SCHEMA_STATUS_FILE)) {
    const fileData = fs.readFileSync(SCHEMA_STATUS_FILE, "utf-8");
    const status: SchemaSyncStatus = JSON.parse(fileData);
    return status.synchronized;
  }
  return false;
}

export async function checkAndUpdateSchemaStatus() {
  const synced = await isSchemaSynchronized();
  if (!synced) {
    await synchronizeSchema();
    await saveSchemaSyncStatus(true);
  } else {
    await runMigrations();
  }
}

export async function saveSchemaSyncStatus(synchronized: boolean) {
  const status: SchemaSyncStatus = {
    synchronized,
    checkedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.resolve(SCHEMA_STATUS_FILE),
    JSON.stringify(status, null, 2),
    "utf-8"
  );
}
