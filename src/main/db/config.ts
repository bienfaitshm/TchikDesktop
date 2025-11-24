import "dotenv/config";
import { Sequelize } from "sequelize";
import * as fs from "fs/promises"; // Utilisation de fs/promises pour les opérations asynchrones
import * as path from "path"; // Pour manipuler les chemins de fichiers
import { getLogger } from "@/main/libs/logger";

// Logger dédié pour la configuration de la base de données
const dbConfigLogger = getLogger("DBConfig");

export const DEFAULT_DB_FILENAME = "./database.sqlite";
const BACKUP_DIR = "./backups";
const MAX_BACKUPS = 5; // Limite le nombre de sauvegardes pour ne pas saturer le disque

const config = {
  dialect: "sqlite",
  storage: DEFAULT_DB_FILENAME,
};

export const sequelize = new Sequelize(config as any);

// -----------------------------------------------------
// 💾 Système de Sauvegarde (Backup)
// -----------------------------------------------------

/**
 * Nettoie les anciens fichiers de sauvegarde pour ne garder que MAX_BACKUPS.
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const files = await fs.readdir(BACKUP_DIR);

    // Filtrer uniquement les fichiers de sauvegarde (commence par le nom de la DB)
    const dbFiles = files.filter((f) =>
      f.startsWith(path.basename(DEFAULT_DB_FILENAME))
    );

    if (dbFiles.length > MAX_BACKUPS) {
      // Trie les fichiers par date (du plus ancien au plus récent)
      const sortedFiles = dbFiles
        .map((file) => ({
          name: file,
          time: fs
            .stat(path.join(BACKUP_DIR, file))
            .then((stat) => stat.mtimeMs),
        }))
        // Attend toutes les promesses de stat
        .filter((item) => item.time !== undefined)
        .sort((a, b) => (a.time as any) - (b.time as any));

      const filesToDelete = sortedFiles.slice(
        0,
        sortedFiles.length - MAX_BACKUPS
      );

      for (const file of filesToDelete) {
        await fs.unlink(path.join(BACKUP_DIR, file.name));
        dbConfigLogger.info(`Ancienne sauvegarde supprimée : ${file.name}`);
      }
    }
  } catch (error) {
    // Log d'erreur, mais ne bloque pas l'opération de backup si le cleanup échoue
    dbConfigLogger.error(
      "Échec du nettoyage des anciennes sauvegardes.",
      error instanceof Error ? error : String(error)
    );
  }
}

/**
 * Exécute une sauvegarde en copiant le fichier de la base de données.
 * @returns Le chemin du fichier de sauvegarde créé.
 */
export async function performBackup(): Promise<string | undefined> {
  const dbPath = path.resolve(DEFAULT_DB_FILENAME);
  const dbExists = await fs.stat(dbPath).catch(() => null);

  if (!dbExists) {
    dbConfigLogger.warn(
      `Impossible de faire la sauvegarde : le fichier source ${dbPath} n'existe pas.`
    );
    return undefined;
  }

  try {
    // 1. Assure que le répertoire de sauvegarde existe
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // 2. Crée un nom de fichier horodaté
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dbName = path.basename(DEFAULT_DB_FILENAME, ".sqlite");
    const backupFileName = `${dbName}-${timestamp}.sqlite`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // 3. Copie le fichier (méthode simple et efficace pour SQLite)
    await fs.copyFile(dbPath, backupPath);

    dbConfigLogger.info(`Sauvegarde de la base de données réussie.`, {
      path: backupPath,
    });

    // 4. Nettoyage des anciennes sauvegardes
    await cleanupOldBackups();

    return backupPath;
  } catch (error) {
    dbConfigLogger.error(
      "Échec de l'opération de sauvegarde de la base de données.",
      error instanceof Error ? error : String(error)
    );
    return undefined;
  }
}
