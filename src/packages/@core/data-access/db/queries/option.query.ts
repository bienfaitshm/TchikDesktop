import { db } from "../config";
import { options } from "../schemas/schema";
import { eq, sql, asc } from "drizzle-orm";
import { getLogger, CustomLogger } from "@/packages/logger";
import { applyFilters } from "./drizzle-builder";

// Inférence des types depuis le schéma Drizzle
type TOption = typeof options.$inferSelect;
type TOptionInsert = typeof options.$inferInsert;

const logger: CustomLogger = getLogger("Option query");

/**
 * Ordre de tri par défaut : Nom de l'option (insensible à la casse)
 */
const DEFAULT_SORT_ORDER = asc(sql`lower(${options.optionName})`);

/**
 * Service de gestion des Options Académiques.
 * Réécrit avec Drizzle ORM pour des performances accrues et un typage strict.
 */
export class OptionQuery {
  /**
   * Récupère une liste d'options académiques filtrée.
   */
  static async findMany(filters?: any): Promise<TOption[]> {
    if (!filters?.schoolId) {
      return [];
    }

    try {
      const query = db.select().from(options).$dynamic();

      // Utilisation du builder dynamique pour gérer les filtres et le tri
      return await applyFilters(query, options, filters, DEFAULT_SORT_ORDER);
    } catch (error) {
      logger.error("OptionQuery.findMany: DB query failed.", error as Error);
      throw new Error(
        "Service indisponible : Impossible de récupérer les options.",
      );
    }
  }

  /**
   * Récupère une option académique unique par son ID.
   */
  static async findById(optionId: string): Promise<TOption | null> {
    if (!optionId) {
      logger.warn("OptionQuery.findById: Appelé avec un ID vide.");
      return null;
    }

    try {
      const [result] = await db
        .select()
        .from(options)
        .where(eq(options.optionId, optionId));

      return result || null;
    } catch (error) {
      logger.error(
        `OptionQuery.findById: Erreur pour l'ID ${optionId}.`,
        error as Error,
      );
      throw new Error(
        "Service indisponible : Impossible de récupérer les détails.",
      );
    }
  }

  /**
   * Crée une nouvelle option académique.
   */
  static async create(data: TOptionInsert): Promise<TOption> {
    try {
      const [newOption] = await db.insert(options).values(data).returning();

      logger.info(`Option créée: ${newOption.optionId}`, {
        name: newOption.optionName,
      });
      return newOption;
    } catch (error) {
      logger.error("OptionQuery.create: Échec de la création.", error as Error);
      throw error;
    }
  }

  /**
   * Met à jour une option existante.
   */
  static async update(
    optionId: string,
    updates: Partial<TOptionInsert>,
  ): Promise<TOption | null> {
    if (!optionId) return null;

    try {
      const [updated] = await db
        .update(options)
        .set(updates)
        .where(eq(options.optionId, optionId))
        .returning();

      if (!updated) {
        logger.warn(`OptionQuery.update: ID ${optionId} non trouvé.`);
        return null;
      }

      return updated;
    } catch (error) {
      logger.error(
        `OptionQuery.update: Erreur lors de la mise à jour de ${optionId}.`,
        error as Error,
      );
      throw new Error("Service indisponible : Échec de la mise à jour.");
    }
  }

  /**
   * Supprime une option académique par son ID.
   */
  static async delete(optionId: string): Promise<boolean> {
    if (!optionId) return false;

    try {
      const result = await db
        .delete(options)
        .where(eq(options.optionId, optionId));

      // Note: Selon le driver SQLite utilisé, vous pouvez vérifier result.rowsAffected
      return true;
    } catch (error) {
      logger.error(
        `OptionQuery.delete: Erreur lors de la suppression de ${optionId}.`,
        error as Error,
      );
      throw new Error(
        "Erreur de service : Échec de la suppression. Vérifiez si des classes sont encore liées à cette option.",
      );
    }
  }
}
