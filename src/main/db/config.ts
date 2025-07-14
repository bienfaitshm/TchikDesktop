import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";

export const client = createClient({
  url: process.env.DB_FILE_NAME || "file:local_database.db",
});
export const db = drizzle({ client });

export async function applyMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./Drizzle" });
    console.log("Migrations appliquées avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'application des migrations:", error);
  }
}
