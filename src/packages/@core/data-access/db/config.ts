import "dotenv/config";
import * as fs from "fs/promises";
import * as path from "path";
import { getLogger } from "@/packages/logger";
import { getUserDataPath, getResourcePath } from "@/packages/electron-utility";
import { createDrizzleLogger } from "./drizzle-adapter";
import { BetterSqliteDatabaseClient, type IDatabaseClient } from "./db";

const dbLogger = getLogger("DataBase");

const DB_CONFIG = {
  FILENAME: getUserDataPath(process.env.DB_FILENAME || "sqlite.db"),
  BACKUP_DIR: getUserDataPath(process.env.DB_BACKUP_DIR || "backups"),
  MAX_BACKUPS: parseInt(process.env.DB_MAX_BACKUPS || "10", 10),
  MIGRATIONS_FOLDER: getResourcePath(
    process.env.DB_MIGRATIONS_FOLDER || "drizzle",
  ),
};

/**
 * Manages database initialization, migrations, and automated backup cycles.
 */
export class DatabaseManager<TDb> {
  constructor(private databaseClient: IDatabaseClient<TDb>) {}

  /**
   * Initializes the database, applying pending migrations.
   */
  public async initialize(): Promise<void> {
    try {
      dbLogger.info(`Initializing database at: ${DB_CONFIG.FILENAME}`);
      await this.databaseClient.migrate(DB_CONFIG.MIGRATIONS_FOLDER);
      dbLogger.info("Drizzle migrations applied successfully.");
    } catch (error) {
      dbLogger.error(
        "Critical failure during database initialization.",
        error as Error,
      );
      throw error;
    }
  }

  public getDBName(): string {
    return path.basename(DB_CONFIG.FILENAME, ".db");
  }

  /**
   * Returns sorted backup files (oldest to newest).
   */
  public async getBackupFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    return this.getSortedBackupFiles();
  }

  /**
   * Performs a backup by copying the source database file.
   * @returns The path of the created backup file.
   */
  public async performBackup(): Promise<string> {
    const dbPath = path.resolve(DB_CONFIG.FILENAME);

    const dbExists = await fs.stat(dbPath).catch(() => null);
    if (!dbExists) {
      throw new Error(`Backup failed: source file ${dbPath} does not exist.`);
    }

    await fs.mkdir(DB_CONFIG.BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      DB_CONFIG.BACKUP_DIR,
      `${this.getDBName()}-${timestamp}.db`,
    );

    await fs.copyFile(dbPath, backupPath);
    dbLogger.info(`Backup successful: ${backupPath}`);

    await this.cleanupOldBackups();
    return backupPath;
  }

  private async cleanupOldBackups(): Promise<void> {
    const files = await this.getSortedBackupFiles();

    if (files.length <= DB_CONFIG.MAX_BACKUPS) return;

    const filesToDelete = files.slice(0, files.length - DB_CONFIG.MAX_BACKUPS);
    await Promise.all(
      filesToDelete.map(async (file) => {
        await fs.unlink(path.join(DB_CONFIG.BACKUP_DIR, file.name));
        dbLogger.info(`Old backup removed: ${file.name}`);
      }),
    );
  }

  private async getSortedBackupFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    const dbBaseName = this.getDBName();
    const files = await fs.readdir(DB_CONFIG.BACKUP_DIR).catch(() => []);
    const dbFiles = files.filter((f) => f.startsWith(dbBaseName));

    const filesWithStats = await Promise.all(
      dbFiles.map(async (file) => {
        const filePath = path.join(DB_CONFIG.BACKUP_DIR, file);
        const stat = await fs.stat(filePath);
        return { name: file, time: stat.mtimeMs };
      }),
    );

    return filesWithStats.sort((a, b) => a.time - b.time);
  }
}

export const dbClient = new BetterSqliteDatabaseClient(
  DB_CONFIG.FILENAME,
  createDrizzleLogger(dbLogger),
);

export const dbManager = new DatabaseManager(dbClient);
export const db = dbClient.db;
export type TDataBase = typeof db;
