import { type Client, createClient } from "@libsql/client";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

export interface IDatabaseClient {
  client: Client;
  migrate<DB extends Record<string, unknown>>(
    db: LibSQLDatabase<DB>,
    migrationFolder: string,
  ): Promise<void>;
}

export class DatabaseClient implements IDatabaseClient {
  client: Client;
  constructor(private fileName: string) {
    this.client = createClient({ url: `file:${this.fileName}` });
  }

  async migrate<DB extends Record<string, unknown>>(
    db: LibSQLDatabase<DB>,
    migrationsFolder: string,
  ): Promise<void> {
    await migrate(db, { migrationsFolder });
  }
}
