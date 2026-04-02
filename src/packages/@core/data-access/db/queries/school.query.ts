import { eq } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { db } from "../config";
import { schools, studyYears } from "../schemas/schema";
import { applyQueryOptions, mergeQueryOptions } from "./drizzle-builder";
import type {
  TSchool,
  TSchoolInsert,
  TSchoolUpdate,
  TStudyYear,
  TStudyYearUpdate,
  TStudyYearInsert,
  FindManyOptions,
} from "../schemas/types";

const logger = getLogger("StudyYear-School-Queries");

const DEFAULT_SORTS = {
  SCHOOL: { orderBy: [{ column: "name", order: "asc" }] } as FindManyOptions<
    typeof schools
  >,
  YEAR: {
    orderBy: [
      { column: "yearName", order: "desc" },
      { column: "startDate", order: "desc" },
    ],
  } as FindManyOptions<typeof studyYears>,
} as const;

export class SchoolQuery {
  static async findMany(
    filters?: FindManyOptions<typeof schools>,
  ): Promise<TSchool[]> {
    try {
      const query = db.select().from(schools).$dynamic();
      return await applyQueryOptions(
        query,
        schools,
        mergeQueryOptions(filters, DEFAULT_SORTS.SCHOOL),
      );
    } catch (error) {
      logger.error("SchoolQuery.findMany failed", { error, filters });
      throw new Error("Failed to fetch schools.");
    }
  }

  static async findById(schoolId: string): Promise<TSchool | null> {
    if (!schoolId) return null;
    try {
      const [results] = await db
        .select()
        .from(schools)
        .where(eq(schools.schoolId, schoolId));
      return results ?? null;
    } catch (error) {
      logger.error(`SchoolQuery.findById failed for ID: ${schoolId}`, {
        error,
      });
      throw new Error("Failed to fetch school.");
    }
  }

  static async create(payload: TSchoolInsert): Promise<TSchool> {
    try {
      const [newRecord] = await db.insert(schools).values(payload).returning();
      return newRecord;
    } catch (error) {
      logger.error("SchoolQuery.create failed", { error, payload });
      throw error;
    }
  }

  static async update(
    schoolId: string,
    updates: TSchoolUpdate,
  ): Promise<TSchool | null> {
    if (!schoolId) return null;
    try {
      const [updated] = await db
        .update(schools)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schools.schoolId, schoolId))
        .returning();
      return updated ?? null;
    } catch (error) {
      logger.error(`SchoolQuery.update failed for ID: ${schoolId}`, {
        error,
        updates,
      });
      throw new Error("Update failed.");
    }
  }

  static async delete(schoolId: string): Promise<boolean> {
    if (!schoolId) return false;
    try {
      const result = await db
        .delete(schools)
        .where(eq(schools.schoolId, schoolId))
        .returning({ id: schools.schoolId });
      return result.length > 0;
    } catch (error) {
      logger.error(`SchoolQuery.delete failed for ID: ${schoolId}`, { error });
      throw new Error("Deletion failed.");
    }
  }
}

export class StudyYearQuery {
  /**
   * Récupère les années scolaires avec un moteur de recherche et filtrage dynamique.
   * @param filters Options de recherche, tri et pagination
   */
  static async findMany(
    filters?: FindManyOptions<typeof studyYears>,
  ): Promise<TStudyYear[]> {
    try {
      const query = db.select().from(studyYears).$dynamic();

      const finalOptions = mergeQueryOptions(filters, DEFAULT_SORTS.YEAR);

      return await applyQueryOptions(query, studyYears, finalOptions);
    } catch (error) {
      logger.error("StudyYearQuery.findMany: Échec de la récupération", {
        error: (error as Error).message,
        filters,
      });
      throw new Error("Impossible de lister les années scolaires.");
    }
  }

  /**
   * Trouve une année spécifique par son ID.
   */
  static async findById(yearId: string): Promise<TStudyYear | null> {
    if (!yearId) return null;

    try {
      const [results] = await db
        .select()
        .from(studyYears)
        .where(eq(studyYears.yearId, yearId));

      return results ?? null;
    } catch (error) {
      logger.error(`StudyYearQuery.findById: Erreur sur l'ID ${yearId}`, {
        error,
      });
      throw new Error("Erreur lors de la recherche de l'année scolaire.");
    }
  }

  /**
   * Crée une nouvelle année scolaire.
   */
  static async create(payload: TStudyYearInsert): Promise<TStudyYear> {
    try {
      const [newYear] = await db.insert(studyYears).values(payload).returning();

      logger.info(
        `Nouvelle année scolaire créée: ${newYear.yearName} (${newYear.yearId})`,
      );
      return newYear;
    } catch (error) {
      logger.error("StudyYearQuery.create: Échec de l'insertion", {
        error: (error as Error).message,
        payload,
      });
      throw error;
    }
  }

  /**
   * Met à jour les informations d'une année.
   */
  static async update(
    yearId: string,
    updates: TStudyYearUpdate,
  ): Promise<TStudyYear | null> {
    if (!yearId) return null;

    try {
      const [updated] = await db
        .update(studyYears)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(studyYears.yearId, yearId))
        .returning();

      if (updated) {
        logger.debug(`Année scolaire mise à jour: ${yearId}`);
      }

      return updated ?? null;
    } catch (error) {
      logger.error(
        `StudyYearQuery.update: Erreur de mise à jour pour ${yearId}`,
        {
          error: (error as Error).message,
          updates,
        },
      );
      throw new Error("Échec de la modification de l'année scolaire.");
    }
  }

  /**
   * Supprime une année scolaire.
   * @returns true si supprimé, false si non trouvé.
   */
  static async delete(yearId: string): Promise<boolean> {
    if (!yearId) return false;

    try {
      const deletedRows = await db
        .delete(studyYears)
        .where(eq(studyYears.yearId, yearId))
        .returning({ deletedId: studyYears.yearId });

      const isDeleted = deletedRows.length > 0;

      if (isDeleted) {
        logger.info(`Année scolaire supprimée: ${yearId}`);
      }

      return isDeleted;
    } catch (error) {
      logger.error(`StudyYearQuery.delete: Échec pour ${yearId}`, { error });
      throw new Error(
        "Impossible de supprimer cette année scolaire (elle est peut-être liée à d'autres données).",
      );
    }
  }
}
