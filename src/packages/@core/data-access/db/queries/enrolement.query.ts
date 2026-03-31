import { db } from "../config";
import {
  classroomEnrolements,
  users,
  classRooms,
  studyYears,
} from "../schemas/schema";
import { eq, and, sql, count, asc } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { applyFilters } from "./drizzle-builder";

const logger = getLogger("Enrolement Query");

// Tri par nom d'utilisateur (insensible à la casse)
const DEFAULT_SORT_ORDER = [
  asc(sql`lower(${users.lastName})`),
  asc(sql`lower(${users.middleName})`),
  asc(sql`lower(${users.firstName})`),
];

export class EnrolementQuery {
  /**
   * Helper pour valider les filtres obligatoires
   */
  private static validateContext(filters: any) {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("Validation Error: schoolId and yearId are required.");
    }
  }

  /**
   * Récupère les inscriptions avec jointures (User, Classroom, StudyYear)
   */
  static async findMany(filters: any): Promise<any[]> {
    this.validateContext(filters);
    try {
      const query = db
        .select()
        .from(classroomEnrolements)
        .innerJoin(users, eq(classroomEnrolements.studentId, users.userId))
        .innerJoin(
          classRooms,
          eq(classroomEnrolements.classroomId, classRooms.classId),
        )
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .$dynamic();

      return await applyFilters(
        query,
        classroomEnrolements,
        filters,
        DEFAULT_SORT_ORDER,
      );
    } catch (error) {
      logger.error(
        "EnrolementQuery.findMany: DB query failed.",
        error as Error,
      );
      throw new Error("Erreur lors de la récupération des inscriptions.");
    }
  }

  /**
   * Récupère une inscription spécifique par son ID
   */
  static async findById(enrolementId: string): Promise<any | null> {
    if (!enrolementId) return null;
    try {
      const [result] = await db
        .select()
        .from(classroomEnrolements)
        .innerJoin(users, eq(classroomEnrolements.studentId, users.userId))
        .innerJoin(
          classRooms,
          eq(classroomEnrolements.classroomId, classRooms.classId),
        )
        .where(eq(classroomEnrolements.enrolementId, enrolementId));

      return result || null;
    } catch (error) {
      logger.error(
        `EnrolementQuery.findById: Error for ${enrolementId}`,
        error as Error,
      );
      return null;
    }
  }

  // =============================================================================
  //  STATISTIQUES & ANALYTICS
  // =============================================================================

  static async getTotalStudents(filters: any): Promise<number> {
    this.validateContext(filters);
    const [result] = await db
      .select({ value: count() })
      .from(classroomEnrolements)
      .where(
        and(
          eq(classroomEnrolements.schoolId, filters.schoolId),
          eq(classroomEnrolements.yearId, filters.yearId),
        ),
      );
    return result?.value ?? 0;
  }

  /**
   * Agrégation par classe (Optimisé)
   */
  static async getStudentsCountByClass(filters: any) {
    this.validateContext(filters);
    return db
      .select({
        classroomId: classroomEnrolements.classroomId,
        label: classRooms.identifier,
        shortName: classRooms.shortIdentifier,
        value: count(classroomEnrolements.studentId),
      })
      .from(classroomEnrolements)
      .innerJoin(
        classRooms,
        eq(classroomEnrolements.classroomId, classRooms.classId),
      )
      .where(
        and(
          eq(classroomEnrolements.schoolId, filters.schoolId),
          eq(classroomEnrolements.yearId, filters.yearId),
        ),
      )
      .groupBy(
        classroomEnrolements.classroomId,
        classRooms.identifier,
        classRooms.shortIdentifier,
      )
      .orderBy(classRooms.shortIdentifier);
  }

  /**
   * Métriques de rétention en UNE SEULE requête SQL
   */
  static async getRetentionMetrics(filters: any) {
    this.validateContext(filters);
    const [results] = await db
      .select({
        total: count(),
        news: sql<number>`count(case when ${classroomEnrolements.isNewStudent} = 1 then 1 end)`,
      })
      .from(classroomEnrolements)
      .where(
        and(
          eq(classroomEnrolements.schoolId, filters.schoolId),
          eq(classroomEnrolements.yearId, filters.yearId),
        ),
      );

    const total = results?.total ?? 0;
    const news = results?.news ?? 0;
    return { total, news, oldStudents: total - news };
  }

  static async getStudentStatusStats(filters: any) {
    this.validateContext(filters);
    return db
      .select({
        status: classroomEnrolements.status,
        count: count(),
      })
      .from(classroomEnrolements)
      .where(
        and(
          eq(classroomEnrolements.schoolId, filters.schoolId),
          eq(classroomEnrolements.yearId, filters.yearId),
        ),
      )
      .groupBy(classroomEnrolements.status);
  }

  // =============================================================================
  //  MUTATIONS & TRANSACTIONS
  // =============================================================================

  /**
   * Création rapide avec transaction atomique
   */
  static async quickCreate({
    student,
    isInSystem,
    studentId,
    ...enrolementData
  }: any) {
    return await db.transaction(async (tx) => {
      let finalStudentId = studentId;

      if (!isInSystem && student) {
        // Création de l'utilisateur dans la transaction
        const [newUser] = await tx
          .insert(users)
          .values({ ...student, schoolId: enrolementData.schoolId })
          .returning();
        finalStudentId = newUser.userId;
      }

      const [enrolement] = await tx
        .insert(classroomEnrolements)
        .values({ ...enrolementData, studentId: finalStudentId })
        .returning();

      return enrolement;
    });
  }

  static async update(enrolementId: string, data: any) {
    if (!enrolementId) return null;
    const [updated] = await db
      .update(classroomEnrolements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classroomEnrolements.enrolementId, enrolementId))
      .returning();
    return updated || null;
  }

  static async delete(enrolementId: string): Promise<boolean> {
    if (!enrolementId) return false;
    await db
      .delete(classroomEnrolements)
      .where(eq(classroomEnrolements.enrolementId, enrolementId));
    return true;
  }
}
