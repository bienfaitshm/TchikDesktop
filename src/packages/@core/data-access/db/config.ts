import "dotenv/config";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as fs from "fs/promises";
import * as path from "path";
import { getLogger } from "@/packages/logger";

const dbLogger = getLogger("DataBase");

const DB_CONFIG = {
  FILENAME: process.env.DB_FILENAME || "sqlite.db",
  BACKUP_DIR: process.env.BACKUP_DIR || "./backups",
  MAX_BACKUPS: parseInt(process.env.DB_MAX_BACKUPS || "10", 10),
  MIGRATIONS_FOLDER: process.env.DB_MIGRATIONS_FOLDER || "./drizzle",
};

export class DatabaseManager {
  private static instance: DatabaseManager;
  private client: Client;
  public db: LibSQLDatabase;

  private constructor() {
    this.client = createClient({ url: `file:${DB_CONFIG.FILENAME}` });
    this.db = drizzle(this.client);
  }

  /**
   * Retourne l'instance unique du DatabaseManager (Singleton).
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialise la base de données.
   * Crée le fichier (automatique via libsql) et applique les migrations en attente.
   */
  public async initialize(): Promise<void> {
    try {
      dbLogger.info(
        `Initialisation de la base de données : ${DB_CONFIG.FILENAME}`,
      );
      await migrate(this.db, { migrationsFolder: DB_CONFIG.MIGRATIONS_FOLDER });

      dbLogger.info("Migrations Drizzle appliquées avec succès.");
    } catch (error) {
      dbLogger.error(
        "Échec critique lors de l'initialisation/migration de la base de données.",
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Exécute une sauvegarde en copiant le fichier de la base de données.
   * @returns Le chemin du fichier de sauvegarde créé, ou undefined si échec.
   */
  public async performBackup(): Promise<string | undefined> {
    const dbPath = path.resolve(DB_CONFIG.FILENAME);

    try {
      const dbExists = await fs.stat(dbPath).catch(() => null);
      if (!dbExists) {
        dbLogger.warn(
          `Backup annulé : le fichier source ${dbPath} n'existe pas encore.`,
        );
        return undefined;
      }

      await fs.mkdir(DB_CONFIG.BACKUP_DIR, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const dbBaseName = path.basename(DB_CONFIG.FILENAME, ".db");
      const backupFileName = `${dbBaseName}-${timestamp}.db`;
      const backupPath = path.join(DB_CONFIG.BACKUP_DIR, backupFileName);

      await fs.copyFile(dbPath, backupPath);
      dbLogger.info(`Sauvegarde réussie : ${backupPath}`);

      await this.cleanupOldBackups(dbBaseName);

      return backupPath;
    } catch (error) {
      dbLogger.error("Échec de l'opération de sauvegarde.", error as Error);
      return undefined;
    }
  }

  /**
   * Nettoie les anciens fichiers de sauvegarde pour ne garder que MAX_BACKUPS.
   */
  private async cleanupOldBackups(dbBaseName: string): Promise<void> {
    try {
      const files = await fs.readdir(DB_CONFIG.BACKUP_DIR);
      const dbFiles = files.filter((f) => f.startsWith(dbBaseName));

      if (dbFiles.length <= DB_CONFIG.MAX_BACKUPS) return;

      const filesWithStats = await Promise.all(
        dbFiles.map(async (file) => {
          const filePath = path.join(DB_CONFIG.BACKUP_DIR, file);
          const stat = await fs.stat(filePath);
          return { name: file, time: stat.mtimeMs };
        }),
      );

      filesWithStats.sort((a, b) => a.time - b.time);

      const filesToDelete = filesWithStats.slice(
        0,
        filesWithStats.length - DB_CONFIG.MAX_BACKUPS,
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
}

export const dbManager = DatabaseManager.getInstance();
export const db = dbManager.db;
