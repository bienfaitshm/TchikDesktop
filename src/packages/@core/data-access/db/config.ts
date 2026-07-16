import "dotenv/config";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator"; // Import spécifique pour LibSQL
import * as fs from "fs/promises";
import * as path from "path";
import * as schema from "./schemas";
import { getLogger } from "@/packages/logger";
import { getUserDataPath, getResourcePath } from "@/packages/electron-utility";
import { createDrizzleLogger } from "./drizzle-adapter";

const dbLogger = getLogger("DataBase");

const DB_CONFIG = {
  // LibSQL utilise un format de connection string "file:..."
  FILENAME: `file:${getUserDataPath(process.env.DB_FILENAME || "sqlite.db")}`,
  BACKUP_DIR: getUserDataPath(process.env.BACKUP_DIR || "backups"),
  MAX_BACKUPS: parseInt(process.env.DB_MAX_BACKUPS || "10", 10),
  MIGRATIONS_FOLDER: getResourcePath(
    process.env.DB_MIGRATIONS_FOLDER || "drizzle",
  ),
};

export class DatabaseManager {
  private static instance: DatabaseManager;
  private client: Client; // Type LibSQL Client
  public db: LibSQLDatabase<typeof schema>; // Type Drizzle LibSQL

  private constructor() {
    // Initialisation du client LibSQL
    this.client = createClient({
      url: DB_CONFIG.FILENAME,
      // LibSQL gère souvent WAL par défaut via le connection string si besoin,
      // mais on peut aussi configurer ici si nécessaire.
    });

    this.db = drizzle(this.client, {
      schema,
      logger: createDrizzleLogger(dbLogger),
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      dbLogger.info(
        `Initialisation de la base de données : ${DB_CONFIG.FILENAME}`,
      );

      // migrate est maintenant la version LibSQL
      await migrate(this.db, { migrationsFolder: DB_CONFIG.MIGRATIONS_FOLDER });

      dbLogger.info("Migrations Drizzle (LibSQL) appliquées avec succès.");
    } catch (error) {
      dbLogger.error(
        "Échec critique lors de l'initialisation/migration de la base de données.",
        error as Error,
      );
      throw error;
    }
  }

  public getDBName(): string {
    // Nettoyage du nom pour enlever le préfixe "file:"
    const cleanPath = DB_CONFIG.FILENAME.replace("file:", "");
    return path.basename(cleanPath, ".db");
  }

  public async getBackDBFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    return this.getSortedBackupFiles();
  }

  /**
   * Note : Comme LibSQL local utilise un fichier SQLite standard,
   * ta logique de sauvegarde par copie de fichier reste parfaitement valide.
   */
  public async performBackup(): Promise<string | undefined> {
    const rawPath = DB_CONFIG.FILENAME.replace("file:", "");
    const dbPath = path.resolve(rawPath);

    try {
      const dbExists = await fs.stat(dbPath).catch(() => null);
      if (!dbExists) {
        dbLogger.warn(
          `Backup annulé : le fichier source ${dbPath} n'existe pas.`,
        );
        return undefined;
      }

      await fs.mkdir(DB_CONFIG.BACKUP_DIR, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const dbBaseName = this.getDBName();
      const backupFileName = `${dbBaseName}-${timestamp}.db`;
      const backupPath = path.join(DB_CONFIG.BACKUP_DIR, backupFileName);

      await fs.copyFile(dbPath, backupPath);
      dbLogger.info(`Sauvegarde réussie : ${backupPath}`);

      await this.cleanupOldBackups();
      return backupPath;
    } catch (error) {
      dbLogger.error("Échec de l'opération de sauvegarde.", error as Error);
      return undefined;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await this.getSortedBackupFiles();
      if (files.length <= DB_CONFIG.MAX_BACKUPS) return;

      const filesToDelete = files.slice(
        0,
        files.length - DB_CONFIG.MAX_BACKUPS,
      );
      await Promise.all(
        filesToDelete.map(async (file) => {
          await fs.unlink(path.join(DB_CONFIG.BACKUP_DIR, file.name));
          dbLogger.info(`Ancienne sauvegarde supprimée : ${file.name}`);
        }),
      );
    } catch (error) {
      dbLogger.error(
        "Échec du nettoyage des anciennes sauvegardes.",
        error as Error,
      );
    }
  }

  private async getSortedBackupFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    const dbBaseName = this.getDBName();
    await fs.mkdir(DB_CONFIG.BACKUP_DIR, { recursive: true });

    const files = await fs.readdir(DB_CONFIG.BACKUP_DIR);
    const dbFiles = files.filter((f) => f.startsWith(dbBaseName));

    const filesWithStats = await Promise.all(
      dbFiles.map(async (file) => {
        const filePath = path.join(DB_CONFIG.BACKUP_DIR, file);
        const stat = await fs.stat(filePath);
        return { name: file, time: stat.mtimeMs };
      }),
    );

    filesWithStats.sort((a, b) => a.time - b.time);
    return filesWithStats;
  }
}

export const dbManager = DatabaseManager.getInstance();
export const db = dbManager.db;
export type TDataBase = typeof db;
