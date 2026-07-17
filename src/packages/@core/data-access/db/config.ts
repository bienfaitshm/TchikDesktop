import "dotenv/config";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as fs from "fs/promises";
import * as path from "path";
import * as schema from "./schemas";
import { getLogger } from "@/packages/logger";
import { getUserDataPath, getResourcePath } from "@/packages/electron-utility";
import { createDrizzleLogger } from "./drizzle-adapter";
import { DatabaseClient, type IDatabaseClient } from "./db";

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
  public db: LibSQLDatabase<typeof schema>;

  constructor(private dataBase: IDatabaseClient) {
    this.db = drizzle(this.dataBase.client, {
      schema,
      logger: createDrizzleLogger(dbLogger),
    });
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
      await this.dataBase.migrate(this.db, DB_CONFIG.MIGRATIONS_FOLDER);

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
   * Retourne la liste des fichiers de sauvegarde (triés par date, du plus ancien au plus récent).
   */
  public async getBackDBFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    return this.getSortedBackupFiles();
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
   * Méthode privée factorisant la lecture, le filtrage et le tri des fichiers de sauvegarde.
   * @returns Tableau trié par date (mtimeMs) des fichiers de backup, du plus ancien au plus récent.
   */
  private async getSortedBackupFiles(): Promise<
    Array<{ name: string; time: number }>
  > {
    const dbBaseName = this.getDBName();
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

export const dbClient = new DatabaseClient(DB_CONFIG.FILENAME);
export const dbManager = new DatabaseManager(dbClient);
export const db = dbManager.db;
export type TDataBase = typeof db;
