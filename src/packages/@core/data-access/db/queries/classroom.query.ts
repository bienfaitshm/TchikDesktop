import { eq, sql, asc } from "drizzle-orm";
import { getLogger } from "@/packages/logger";

import { db } from "../config";
import { classRooms, options, studyYears } from "../schemas/schema";
import {
  TClassroom,
  TClassroomInsert,
  TClassroomUpdate,
} from "../schemas/types";
import { applyFilters } from "./drizzle-builder";

const logger = getLogger("ClassroomQuery");

/**
 * Ordre de tri standard : Identifiant complet puis court (insensible à la casse)
 */
const DEFAULT_SORT_ORDER = [
  asc(sql`lower(${classRooms.identifier})`),
  asc(sql`lower(${classRooms.shortIdentifier})`),
];

export class ClassroomQuery {
  /**
   * Récupère une liste de classes avec Option et Année Scolaire.
   */
  static async findMany(filters: any): Promise<any[]> {
    try {
      const query = db
        .select({
          classId: classRooms.classId,
          identifier: classRooms.identifier,
          shortIdentifier: classRooms.shortIdentifier,
          section: classRooms.section,
          schoolId: classRooms.schoolId,
          optionName: options.optionName,
          optionShortName: options.optionShortName,
          yearName: studyYears.yearName,
          startDate: studyYears.startDate,
        })
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .$dynamic();

      return await applyFilters(query, classRooms, filters, DEFAULT_SORT_ORDER);
    } catch (error) {
      logger.error("ClassroomQuery.findMany: Failed to fetch", error as Error);
      throw new Error("Impossible de récupérer la liste des classes.");
    }
  }

  /**
   * Récupère une classe spécifique par son ID.
   */
  static async findById(classId: string): Promise<any | null> {
    if (!classId) return null;

    try {
      const [result] = await db
        .select()
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .where(eq(classRooms.classId, classId));

      return result || null;
    } catch (error) {
      logger.error(
        `ClassroomQuery.findById: Failed for ID ${classId}`,
        error as Error,
      );
      throw new Error("Impossible de récupérer les détails de la classe.");
    }
  }

  /**
   * Récupère les classes avec la liste des élèves inscrits (Jointure triple).
   */
  static async findWithEnrollments(filters: any): Promise<any[]> {
    try {
      const results = await db.query.classRooms.findMany({
        where: filters.schoolId
          ? eq(classRooms.schoolId, filters.schoolId)
          : undefined,
        with: {
          option: true,
          studyYear: true,
          enrolements: {
            with: {
              user: {
                columns: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  gender: true,
                },
              },
            },
          },
        },
        orderBy: DEFAULT_SORT_ORDER,
      });

      return results;
    } catch (error) {
      logger.error(
        "ClassroomQuery.findWithEnrollments: Failed",
        error as Error,
      );
      throw new Error("Impossible de récupérer les inscriptions des classes.");
    }
  }

  /**
   * Crée une nouvelle classe.
   */
  static async create(data: TClassroomInsert): Promise<TClassroom> {
    try {
      const [newClass] = await db.insert(classRooms).values(data).returning();

      logger.info(`Classroom created: ${newClass.classId}`);
      return newClass;
    } catch (error) {
      logger.error("ClassroomQuery.create: Failed", error as Error);
      throw error;
    }
  }

  /**
   * Met à jour une classe.
   */
  static async update(
    classId: string,
    updates: TClassroomUpdate,
  ): Promise<TClassroom | null> {
    try {
      const [updated] = await db
        .update(classRooms)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(classRooms.classId, classId))
        .returning();

      return updated || null;
    } catch (error) {
      logger.error(
        `ClassroomQuery.update: Failed for ${classId}`,
        error as Error,
      );
      throw new Error("Échec de la mise à jour de la classe.");
    }
  }

  /**
   * Supprime une classe.
   */
  static async delete(classId: string): Promise<boolean> {
    try {
      await db.delete(classRooms).where(eq(classRooms.classId, classId));

      return true;
    } catch (error) {
      logger.error(
        `ClassroomQuery.delete: Failed for ${classId}`,
        error as Error,
      );
      throw new Error(
        "Impossible de supprimer la classe (vérifiez les contraintes).",
      );
    }
  }
}
