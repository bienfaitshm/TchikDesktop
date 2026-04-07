import { eq, and, sql, count, getTableColumns } from "drizzle-orm";
import { db } from "../config";
import {
  classroomEnrolements,
  users,
  classRooms,
  studyYears,
} from "../schemas/schema";
import { BaseRepository } from "./base-repository";
import { applyQueryOptions } from "./drizzle-builder";
import type {
  TEnrolement,
  TEnrolementInsert,
  TEnrolementUpdate,
  TEnrolementDetails,
  FindManyOptions,
} from "../schemas/types";

/**
 * Configuration du tri par défaut (Nom complet de l'étudiant)
 */
const ENROLEMENT_DEFAULT_SORT = {
  orderBy: [
    { column: sql`lower(${users.lastName})`, order: "asc" },
    { column: sql`lower(${users.middleName})`, order: "asc" },
    { column: sql`lower(${users.firstName})`, order: "asc" },
  ],
} as unknown as FindManyOptions<typeof classroomEnrolements>;

export class EnrolementQuery extends BaseRepository<
  typeof classroomEnrolements,
  TEnrolement,
  TEnrolementInsert,
  TEnrolementUpdate
> {
  constructor() {
    super(
      classroomEnrolements,
      classroomEnrolements.enrolementId,
      "Enrolement",
      ENROLEMENT_DEFAULT_SORT,
    );
  }

  /**
   * Validation du contexte obligatoire (Multitenancy & Cohérence temporelle)
   */
  private validateContext(filters: { schoolId?: string; yearId?: string }) {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("Missing Context: schoolId and yearId are required.");
    }
  }

  // =============================================================================
  //  LECTURE (OVERRIDE & EXTENSIONS)
  // =============================================================================

  async findManyExtended(
    filters: FindManyOptions<typeof classroomEnrolements>,
  ): Promise<TEnrolementDetails[]> {
    // this.validateContext(filters);
    const { password, updatedAt, createdAt, ...userFields } =
      getTableColumns(users);
    const { classId, schoolId, ...classFields } = getTableColumns(classRooms);
    try {
      const query = db
        .select({
          ...getTableColumns(classroomEnrolements),
          student: userFields,
          classroom: classFields,
          yearName: studyYears.yearName,
        })
        .from(classroomEnrolements)
        .innerJoin(users, eq(classroomEnrolements.studentId, users.userId))
        .innerJoin(
          classRooms,
          eq(classroomEnrolements.classroomId, classRooms.classId),
        )
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .$dynamic();

      return await applyQueryOptions(query, classroomEnrolements, filters);
    } catch (error) {
      this.logError("findManyExtended", error, { filters });
      throw new Error("Impossible de lister les inscriptions.");
    }
  }

  override async findById(enrolementId: string): Promise<any | null> {
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
      this.logError("findById", error, { enrolementId });
      return null;
    }
  }

  // =============================================================================
  //  ANALYTICS (REPORTING)
  // =============================================================================

  async getDashboardMetrics(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters);
    try {
      const [results] = await db
        .select({
          total: count(),
          news: sql<number>`count(case when ${classroomEnrolements.isNewStudent} = true then 1 end)`,
        })
        .from(classroomEnrolements)
        .where(
          and(
            eq(classroomEnrolements.schoolId, filters.schoolId),
            eq(classroomEnrolements.yearId, filters.yearId),
          ),
        );

      const total = Number(results?.total ?? 0);
      const news = Number(results?.news ?? 0);
      return { total, news, oldStudents: total - news };
    } catch (error) {
      this.logError("getDashboardMetrics", error, filters);
      throw error;
    }
  }

  async getCountByClass(filters: { schoolId: string; yearId: string }) {
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

  // =============================================================================
  //  OPERATIONS ATOMIQUES (TRANSACTIONS)
  // =============================================================================

  /**
   * Création d'un étudiant + Inscription en une seule transaction.
   * On évite d'avoir un utilisateur créé sans inscription en cas de crash.
   */
  async quickCreate(payload: {
    student?: any;
    studentId?: string;
    isInSystem: boolean;
    enrolement: TEnrolementInsert;
  }) {
    return await db.transaction(async (tx) => {
      try {
        let targetStudentId = payload.studentId;

        if (!payload.isInSystem && payload.student) {
          const [newUser] = await tx
            .insert(users)
            .values({
              ...payload.student,
              schoolId: payload.enrolement.schoolId,
            })
            .returning();
          targetStudentId = newUser.userId;
        }

        if (!targetStudentId)
          throw new Error("Student ID is required for enrolement.");

        const [enrolement] = await tx
          .insert(classroomEnrolements)
          .values({ ...payload.enrolement, studentId: targetStudentId })
          .returning();

        return enrolement;
      } catch (error) {
        this.logError("quickCreate", error, payload);
        tx.rollback();
        throw error;
      }
    });
  }

  static instance = new EnrolementQuery();
}

export const enrolementService = EnrolementQuery.instance;
