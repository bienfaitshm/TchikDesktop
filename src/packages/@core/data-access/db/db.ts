import { Client, createClient } from "@libsql/client";
import {
  drizzle as drizzleLibSQL,
  type LibSQLDatabase,
} from "drizzle-orm/libsql";
import { migrate as libSqlMigrate } from "drizzle-orm/libsql/migrator";

import Database from "better-sqlite3";
import {
  drizzle as drizzleBetterSQlite,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate as betterSqliteMigrate } from "drizzle-orm/better-sqlite3/migrator";

import type { Logger } from "drizzle-orm/logger";
import * as schema from "./schemas";

/**
 * Contract for database clients wrapping Drizzle ORM instances.
 * @template TDb - The specific Drizzle ORM database type.
 */
export interface IDatabaseClient<TDb> {
  db: TDb;
  migrate(migrationsFolder: string): Promise<void>;
}

/**
 * LibSQL implementation supporting local and remote (edge) databases.
 */
export class LibSqlDatabaseClient implements IDatabaseClient<
  LibSQLDatabase<typeof schema>
> {
  public db: LibSQLDatabase<typeof schema>;
  client: Client;

  /**
   * Initializes the LibSQL client with the specified connection parameters.
   * @param url - The connection string (e.g., "file:local.db" or "libsql://remote.db").
   * @param logger - Optional Drizzle logger configuration.
   * @param authToken - Optional authentication token for remote LibSQL instances.
   */
  constructor(url: string, logger?: boolean | Logger, authToken?: string) {
    this.client = createClient({ url, authToken });
    this.db = drizzleLibSQL(this.client, {
      schema,
      logger,
    });
  }

  /**
   * Executes pending database migrations asynchronously.
   * @param migrationsFolder - Path to the directory containing migration files.
   * @returns A promise that resolves when migrations are complete.
   */
  public async migrate(migrationsFolder: string): Promise<void> {
    await this.client.execute("PRAGMA foreign_keys = OFF;");
    await libSqlMigrate(this.db, { migrationsFolder });
    await this.client.execute("PRAGMA foreign_keys = ON;");
  }
}

/**
 * Better-SQLite3 implementation for high-performance local database access.
 */
export class BetterSqliteDatabaseClient implements IDatabaseClient<
  BetterSQLite3Database<typeof schema>
> {
  public db: BetterSQLite3Database<typeof schema>;
  sqlite: Database.Database;
  /**
   * Initializes the better-sqlite3 client with a local file path.
   * @param fileName - The local file path to the SQLite database.
   * @param logger - Optional Drizzle logger configuration.
   */
  constructor(fileName: string, logger?: boolean | Logger) {
    this.sqlite = new Database(fileName);
    this.db = drizzleBetterSQlite(this.sqlite, {
      schema,
      logger,
    });
  }

  /**
   * Executes pending database migrations.
   * @param migrationsFolder - Path to the directory containing migration files.
   * @returns A promise that resolves immediately after synchronous migration completion.
   */
  public async migrate(migrationsFolder: string): Promise<void> {
    this.sqlite.pragma("foreign_keys = OFF");

    betterSqliteMigrate(this.db, { migrationsFolder });
    this.sqlite.pragma("foreign_keys = ON");
    return Promise.resolve();
  }
}
