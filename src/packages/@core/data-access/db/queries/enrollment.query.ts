import { eq, and, sql, count, getTableColumns } from "drizzle-orm";
import { getLogger } from "@/packages/logger";
import { db, type TDataBase } from "../config";
import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";
import {
  classroomEnrollments,
  users,
  classrooms,
  studyYears,
} from "../schemas/schema";
import { getVisibleUserColumns } from "./users/user.repository";
import { BaseRepository } from "./base-repository";
import type { FindManyOptions } from "../schemas/types";

type TableEnrollment = typeof classroomEnrollments;

/**
 * Configuration du tri par défaut (Nom complet de l'étudiant)
 */
const ENROLEMENT_DEFAULT_SORT: FindManyOptions<TableEnrollment> = {
  orderBy: [],
};
export class EnrolementQuery extends BaseRepository<
  TableEnrollment,
  TDataBase
> {
  constructor() {
    super({
      db,
      table: classroomEnrollments,
      idColumn: classroomEnrollments.classroomId,
      entityName: "En",
      logger: getLogger,
      defaultSort: ENROLEMENT_DEFAULT_SORT,
    });
  }

  /**
   * Validation du contexte obligatoire (Multitenancy & Cohérence temporelle)
   */
  private validateContext(filters: { schoolId?: string; yearId?: string }) {
    if (!filters.schoolId || !filters.yearId) {
      throw new Error("Missing Context: schoolId and yearId are required.");
    }
  }

  protected override getQuerySet(): any {
    const { classId, schoolId, ...classFields } = getTableColumns(classrooms);
    return this.db
      .select({
        ...getTableColumns(classroomEnrollments),
        student: getVisibleUserColumns(),
        classroom: classFields,
        yearName: studyYears.yearName,
      })
      .from(classroomEnrollments)
      .innerJoin(users, eq(classroomEnrollments.studentId, users.userId))
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .innerJoin(studyYears, eq(classrooms.yearId, studyYears.yearId))
      .$dynamic();
  }

  async getDashboardMetrics(filters: { schoolId: string; yearId: string }) {
    this.validateContext(filters);
    try {
      const [results] = await this.db
        .select({
          total: count(),
          news: sql<number>`count(case when ${classroomEnrollments.isNewStudent} = true then 1 end)`,
        })
        .from(classroomEnrollments)
        .where(
          and(
            eq(classroomEnrollments.schoolId, filters.schoolId),
            eq(classroomEnrollments.yearId, filters.yearId),
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
    return this.db
      .select({
        classroomId: classroomEnrollments.classroomId,
        label: classrooms.identifier,
        shortName: classrooms.shortIdentifier,
        value: count(classroomEnrollments.studentId),
      })
      .from(classroomEnrollments)
      .innerJoin(
        classrooms,
        eq(classroomEnrollments.classroomId, classrooms.classId),
      )
      .where(
        and(
          eq(classroomEnrollments.schoolId, filters.schoolId),
          eq(classroomEnrollments.yearId, filters.yearId),
        ),
      )
      .groupBy(
        classroomEnrollments.classroomId,
        classrooms.identifier,
        classrooms.shortIdentifier,
      )
      .orderBy(classrooms.shortIdentifier);
  }

  /**
   * Création d'un étudiant + Inscription en une seule transaction.
   * On évite d'avoir un utilisateur créé sans inscription en cas de crash.
   */
  async quickCreate({
    classroomId,
    isInSystem,
    isNewStudent,
    schoolId,
    status,
    yearId,
    student,
    studentId,
  }: EnrollmentQuickCreate) {
    return await this.db.transaction(async (tx) => {
      try {
        let targetStudentId = studentId;

        if (!isInSystem && student) {
          const [newUser] = await tx
            .insert(users)
            .values({ ...student, schoolId, password: "0000" })
            .returning();
          targetStudentId = newUser.userId;
        }

        if (!targetStudentId)
          throw new Error("Student ID is required for enrolement.");

        const [enrolement] = await tx
          .insert(classroomEnrollments)
          .values({
            classroomId,
            schoolId,
            yearId,
            status,
            isNewStudent,
            studentId: targetStudentId,
          })
          .returning();

        return enrolement;
      } catch (error) {
        this.logError("quickCreate", error, {
          classroomId,
          isInSystem,
          isNewStudent,
          schoolId,
          status,
          yearId,
          student,
          studentId,
        });
        tx.rollback();
        throw error;
      }
    });
  }

  static instance = new EnrolementQuery();
}

export const enrollmentService = EnrolementQuery.instance;
