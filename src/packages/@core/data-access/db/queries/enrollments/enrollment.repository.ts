import { eq, and, sql, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classroomEnrollments,
  users,
  classrooms,
  studyYears,
  type TableClassroomEnrollment,
  type ClassroomEnrollment,
  type User,
  type Classroom,
} from "@/packages/@core/data-access/db/schemas/schema";
import type { FindManyOptions } from "@/packages/@core/data-access/db/schemas/types";
import {
  BaseRepository,
  DatabaseError,
  mergeQueryOptions,
  applyQueryOptions,
} from "@/packages/drizzle-queries";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db/options";

import { UserRepository } from "../users";

export type EnrollmentTDO = ClassroomEnrollment & {
  student: User & { fullName?: string };
  classroom: Omit<Classroom, "classId" | "schoolId">;
  yearName: string;
};

const ENROLLMENT_DEFAULT_SORT: FindManyOptions<TableClassroomEnrollment> = {
  orderBy: [{ column: "createdAt", order: "desc" }],
};

const ACTIVE_ENROLLEMENTS: FindManyOptions<TableClassroomEnrollment> = {
  where: {
    status: STUDENT_STATUS_ENUM.ACTIVE,
  },
};

export class EnrollmentRepository extends BaseRepository<
  TableClassroomEnrollment,
  TDataBase,
  EnrollmentTDO
> {
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: classroomEnrollments,
      idColumn: classroomEnrollments.enrollmentId,
      entityName: "Enrollment",
      logger: getLogger,
      defaultSort: ENROLLMENT_DEFAULT_SORT,
    });
    this.searchFiltersColumns = [
      users.lastName,
      users.middleName,
      users.firstName,
      classrooms.shortIdentifier,
      classrooms.identifier,
    ];
  }

  /**
   * Surcharge propre du QuerySet de base pour inclure systématiquement les relations
   */
  protected override getQuerySet(tx?: TDataBase) {
    const client = this.getClient(tx);
    return client
      .select({
        ...getTableColumns(this.table),
        student: UserRepository.getVisibleColumns(),
        classroom: getTableColumns(classrooms),
        yearName: studyYears.yearName,
      })
      .from(this.table)
      .innerJoin(users, eq(this.table.studentId, users.userId))
      .innerJoin(classrooms, eq(this.table.classroomId, classrooms.classId))
      .innerJoin(studyYears, eq(this.table.yearId, studyYears.yearId))
      .$dynamic();
  }

  /**
   * Récupère uniquement les inscriptions actives (allégées pour traitement lourd ou filtres internes)
   */
  async getActiveEnrollments(
    filters: FindManyOptions<TableClassroomEnrollment>,
    tx?: TDataBase,
  ) {
    try {
      const client = this.getClient(tx) as TDataBase;
      const query = client
        .select({
          enrollmentId: this.table.enrollmentId,
          classroomId: this.table.classroomId,
          optionId: classrooms.optionId,
          student: UserRepository.getVisibleColumns(),
        })
        .from(this.table)
        .innerJoin(users, eq(this.table.studentId, users.userId))
        .innerJoin(classrooms, eq(this.table.classroomId, classrooms.classId))
        .$dynamic();

      return applyQueryOptions(
        query,
        this.table,
        mergeQueryOptions(filters, ACTIVE_ENROLLEMENTS),
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch active enrollments for school ${filters.where?.schoolId}`,
      );
      this.logError("getActiveEnrollments", dbError, filters.where as any);
      throw dbError;
    }
  }

  /**
   * Métriques du Dashboard (Total élèves, Nouveaux, Anciens)
   */
  async getDashboardMetrics(
    ctx: { schoolId: string; yearId: string },
    tx?: TDataBase,
  ) {
    try {
      const client = this.getClient(tx) as TDataBase;
      const [results] = await client
        .select({
          total: count(),
          news: sql<number>`count(case when ${this.table.isNewStudent} = 1 or ${this.table.isNewStudent} = true then 1 end)`,
        })
        .from(this.table)
        .where(
          and(
            eq(this.table.schoolId, ctx.schoolId),
            eq(this.table.yearId, ctx.yearId),
          ),
        );

      const total = Number(results?.total ?? 0);
      const news = Number(results?.news ?? 0);

      return {
        total,
        news,
        oldStudents: total - news,
      };
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Impossible de récupérer les métriques du tableau de bord.",
      );
      this.logError("getDashboardMetrics", dbError, ctx);
      throw dbError;
    }
  }

  /**
   * Calcul des effectifs groupés par classe
   */
  async getCountByClass(
    ctx: { schoolId: string; yearId: string },
    tx?: TDataBase,
  ) {
    try {
      const client = this.getClient(tx) as TDataBase;
      return await client
        .select({
          classroomId: this.table.classroomId,
          label: classrooms.identifier,
          shortName: classrooms.shortIdentifier,
          value: count(this.table.studentId),
        })
        .from(this.table)
        .innerJoin(classrooms, eq(this.table.classroomId, classrooms.classId))
        .where(
          and(
            eq(this.table.schoolId, ctx.schoolId),
            eq(this.table.yearId, ctx.yearId),
          ),
        )
        .groupBy(
          this.table.classroomId,
          classrooms.identifier,
          classrooms.shortIdentifier,
        )
        .orderBy(classrooms.shortIdentifier);
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Erreur lors du calcul des effectifs par classe.",
      );
      this.logError("getCountByClass", dbError, ctx);
      throw dbError;
    }
  }
}
