import { eq, sql, asc } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { db } from "../config";
import { schools, studyYears } from "../schemas/schema";
import { applyFilters, applyQueryOptions } from "./drizzle-builder";
import {
  TSchool,
  TSchoolInsert,
  TSchoolUpdate,
  TStudyYear,
  TStudyYearUpdate,
  TStudyYearInsert,
} from "../schemas/types";

const logger = getLogger("School-StudyYear");

const SCHOOL_DEFAULT_SORT = asc(sql`lower(${schools.name})`);

const YEAR_DEFAULT_SORT = [
  asc(sql`lower(${studyYears.yearName})`),
  asc(studyYears.startDate),
];

export class SchoolQuery {
  /**
   * Récupère la liste des écoles avec filtrage dynamique.
   */
  static async findMany(filters?: any): Promise<TSchool[]> {
    try {
      const query = db.select().from(schools).$dynamic();

      // Utilisation du builder de filtres que nous avons créé
      return await applyFilters(
        query,
        schools,
        filters || {},
        SCHOOL_DEFAULT_SORT,
      );
    } catch (error) {
      logger.error("SchoolQuery.findMany: DB Error", error as Error);
      throw new Error("Impossible de récupérer les écoles.");
    }
  }

  static async findById(schoolId: string): Promise<TSchool | null> {
    if (!schoolId) return null;

    try {
      const [result] = await db
        .select()
        .from(schools)
        .where(eq(schools.schoolId, schoolId));
      return result || null;
    } catch (error) {
      logger.error(
        `SchoolQuery.findById: Error for ID ${schoolId}`,
        error as Error,
      );
      throw new Error("Erreur lors de la récupération de l'école.");
    }
  }

  static async create(payload: TSchoolInsert): Promise<TSchool> {
    try {
      const [newSchool] = await db.insert(schools).values(payload).returning();

      logger.info(`School created: ${newSchool.schoolId}`);
      return newSchool;
    } catch (error) {
      logger.error("SchoolQuery.create: Failed", error as Error);
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

      return updated || null;
    } catch (error) {
      logger.error(`SchoolQuery.update: Error for ${schoolId}`, error as Error);
      throw new Error("Mise à jour de l'école échouée.");
    }
  }

  static async delete(schoolId: string): Promise<boolean> {
    if (!schoolId) return false;

    try {
      const result = await db
        .delete(schools)
        .where(eq(schools.schoolId, schoolId));
      // Sur SQLite, rowsAffected est souvent utilisé via le driver
      return true;
    } catch (error) {
      logger.error(`SchoolQuery.delete: Error for ${schoolId}`, error as Error);
      throw new Error("Suppression de l'école échouée.");
    }
  }
}

export class StudyYearQuery {
  /**
   * Liste les années scolaires d'une école avec tri chronologique.
   */
  static async findMany(
    filters: { schoolId: string } & any,
  ): Promise<TStudyYear[]> {
    if (!filters?.schoolId) {
      throw new Error("Le schoolId est obligatoire pour lister les années.");
    }

    try {
      const query = db.select().from(studyYears).$dynamic();

      return await applyQueryOptions(query, studyYears, {
        where: { schoolId: filters.schoolId },
      });
    } catch (error) {
      logger.error(`StudyYearQuery.findMany: Error`, error as Error);
      throw new Error("Impossible de récupérer les années scolaires.");
    }
  }

  static async findById(yearId: string): Promise<TStudyYear | null> {
    if (!yearId) return null;

    try {
      const [year] = await db
        .select()
        .from(studyYears)
        .where(eq(studyYears.yearId, yearId));
      return year || null;
    } catch (error) {
      logger.error(`StudyYearQuery.findById: Error ${yearId}`, error as Error);
      throw new Error("Erreur de récupération de l'année.");
    }
  }

  static async create(payload: TStudyYearInsert): Promise<TStudyYear> {
    try {
      const [newYear] = await db.insert(studyYears).values(payload).returning();
      return newYear;
    } catch (error) {
      logger.error("StudyYearQuery.create: Failed", error as Error);
      throw error;
    }
  }

  static async update(
    yearId: string,
    updates: TStudyYearUpdate,
  ): Promise<TStudyYear | null> {
    if (!yearId) return null;

    try {
      const [updated] = await db
        .update(studyYears)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(studyYears.yearId, yearId))
        .returning();
      return updated || null;
    } catch (error) {
      logger.error(`StudyYearQuery.update: Error ${yearId}`, error as Error);
      throw new Error("Échec de la mise à jour.");
    }
  }

  static async delete(yearId: string): Promise<boolean> {
    if (!yearId) return false;

    try {
      await db.delete(studyYears).where(eq(studyYears.yearId, yearId));
      return true;
    } catch (error) {
      logger.error(`StudyYearQuery.delete: Error ${yearId}`, error as Error);
      throw new Error("Échec de la suppression.");
    }
  }
}
