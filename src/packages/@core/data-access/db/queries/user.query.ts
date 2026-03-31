import { db } from "../config";
import { users, classroomEnrolements } from "../schemas/schema";
import { TUser, TUserInsert, TUserUpdate } from "../schemas/types";
import { eq, sql, asc, and, inArray } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { applyFilters } from "./drizzle-builder";

const logger = getLogger("User Query");

// Tri standard par nom (insensible à la casse)
const DEFAULT_SORT_ORDER = [
  asc(sql`lower(${users.lastName})`),
  asc(sql`lower(${users.middleName})`),
  asc(sql`lower(${users.firstName})`),
];

export class UserQuery {
  /**
   * Récupère une liste d'utilisateurs avec filtres et jointures optionnelles.
   * Optimisé pour ne faire qu'une seule requête SQL performante.
   */
  static async findMany({
    yearId,
    classroomId,
    ...filters
  }: any): Promise<TUser[]> {
    if (!filters.schoolId) {
      throw new Error(
        "Validation Error: schoolId is required for listing users.",
      );
    }

    try {
      // On commence par une requête de base sur la table Users
      const query = db.select().from(users).$dynamic();

      // Gestion de la jointure "Required" si yearId ou classroomId sont fournis
      // Équivalent à "include: [{ model: ClassroomEnrolement, required: true }]"
      if (yearId || classroomId) {
        query.innerJoin(
          classroomEnrolements,
          eq(users.userId, classroomEnrolements.studentId),
        );

        // Application des filtres de la table de jointure
        const enrollmentFilters = [];
        if (yearId) {
          enrollmentFilters.push(
            Array.isArray(yearId)
              ? inArray(classroomEnrolements.yearId, yearId)
              : eq(classroomEnrolements.yearId, yearId),
          );
        }
        if (classroomId) {
          enrollmentFilters.push(
            Array.isArray(classroomId)
              ? inArray(classroomEnrolements.classroomId, classroomId)
              : eq(classroomEnrolements.classroomId, classroomId),
          );
        }
        query.where(and(...enrollmentFilters));
      }

      // Appliquer les filtres de base (lastName, role, etc.) via notre helper pro
      // et appliquer le tri par défaut
      return await applyFilters(
        query,
        users,
        filters,
        sql`${DEFAULT_SORT_ORDER}, ${DEFAULT_SORT_ORDER}`,
      );
    } catch (error) {
      logger.error("UserQuery.findMany: DB query failed.", error as Error);
      throw new Error("Impossible de récupérer les utilisateurs.");
    }
  }

  /**
   * Récupère un utilisateur par son ID.
   */
  static async findById(userId: string): Promise<TUser | null> {
    if (!userId) return null;

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId));

      return user || null;
    } catch (error) {
      logger.error(
        `UserQuery.findById: Error for ID ${userId}`,
        error as Error,
      );
      throw new Error(
        "Erreur lors de la récupération des détails de l'utilisateur.",
      );
    }
  }

  /**
   * Crée un utilisateur.
   * Les valeurs par défaut (password, username) sont gérées par le schéma Drizzle.
   */
  static async create(payload: TUserInsert): Promise<TUser> {
    try {
      const [newUser] = await db.insert(users).values(payload).returning();

      logger.info(`User created: ${newUser.userId}`, { role: newUser.role });
      return newUser;
    } catch (error) {
      logger.error("UserQuery.create: Insertion failed", error as Error);
      throw error;
    }
  }

  /**
   * Met à jour les données.
   */
  static async update(
    userId: string,
    updates: TUserUpdate,
  ): Promise<TUser | null> {
    if (!userId) return null;

    try {
      const [updatedUser] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.userId, userId))
        .returning();

      return updatedUser || null;
    } catch (error) {
      logger.error(`UserQuery.update: Error for ${userId}`, error as Error);
      throw new Error("La mise à jour de l'utilisateur a échoué.");
    }
  }

  /**
   * Supprime un utilisateur.
   */
  static async delete(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      await db.delete(users).where(eq(users.userId, userId));

      return true;
    } catch (error) {
      logger.error(`UserQuery.delete: Error for ${userId}`, error as Error);
      throw new Error(
        "Échec de la suppression (vérifiez les contraintes de données liées).",
      );
    }
  }
}
