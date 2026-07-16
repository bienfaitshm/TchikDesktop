import "dotenv/config";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as fs from "fs/promises";
import * as path from "path";
import * as schema from "./schemas";
import { getLogger } from "@/packages/logger";
import { getUserDataPath, getResourcePath } from "@/packages/electron-utility";
import { createDrizzleLogger } from "./drizzle-adapter";

const dbLogger = getLogger("DataBase");

const DB_CONFIG = {
  FILENAME: getUserDataPath(process.env.DB_FILENAME || "sqlite.db"),
  BACKUP_DIR: getUserDataPath(process.env.BACKUP_DIR || "backups"),
  MAX_BACKUPS: parseInt(process.env.DB_MAX_BACKUPS || "10", 10),
  MIGRATIONS_FOLDER: getResourcePath(
    process.env.DB_MIGRATIONS_FOLDER || "drizzle",
  ),
};

export class DatabaseManager {
  private static instance: DatabaseManager;
  private client: Database.Database;
  public db: BetterSQLite3Database<typeof schema>;

  private constructor() {
    // Initialisation synchrone du client better-sqlite3
    this.client = new Database(DB_CONFIG.FILENAME);

    this.db = drizzle(this.client, {
      schema,
      logger: createDrizzleLogger(dbLogger),
    });

    /* Optimisation des performances d'écriture SQLite au démarrage */
    try {
      this.client.pragma("journal_mode = WAL");
      this.client.pragma("synchronous = NORMAL");
    } catch (err) {
      dbLogger.error(
        "Échec du paramétrage des PRAGMAs d'optimisation SQLite",
        err as Error,
      );
    }
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
   * Crée le fichier et applique les migrations en attente.
   */
  public async initialize(): Promise<void> {
    try {
      dbLogger.info(
        `Initialisation de la base de données : ${DB_CONFIG.FILENAME}`,
      );

      // La fonction migrate reste asynchrone car elle lit les fichiers de migration sur le disque
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

  public getDBName(): string {
    return path.basename(DB_CONFIG.FILENAME, ".db");
  }

  /**
   * Retourne la liste des fichiers de sauvegarde.
   */
  public async getBackDBFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    return this.getSortedBackupFiles();
  }

  /**
   * Exécute une sauvegarde en copiant le fichier de la base de données.
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
      const dbBaseName = this.getDBName();
      const backupFileName = `${dbBaseName}-${timestamp}.db`;
      const backupPath = path.join(DB_CONFIG.BACKUP_DIR, backupFileName);

      // Copie asynchrone du fichier de base de données
      await fs.copyFile(dbPath, backupPath);
      dbLogger.info(`Sauvegarde réussie : ${backupPath}`);

      await this.cleanupOldBackups();

      return backupPath;
    } catch (error) {
      dbLogger.error("Échec de l'opération de sauvegarde.", error as Error);
      return undefined;
    }
  }

  /**
   * Nettoie les anciens fichiers de sauvegarde pour ne garder que MAX_BACKUPS.
   */
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

  /**
   * Trie les fichiers de backup du plus ancien au plus récent.
   */
  private async getSortedBackupFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    const dbBaseName = this.getDBName();

    // S'assure que le dossier de backup existe avant de le lire
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
