import { eq, and, sql, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classroomEnrollments,
  users,
  classrooms,
  studyYears,
  type TableClassroomEnrollment,
} from "@/packages/@core/data-access/db/schemas/schema";
import type { FindManyOptions } from "@/packages/@core/data-access/db/schemas/types";
import { BaseRepository } from "../base-repository";
import { UserRepository } from "../users/";

const ENROLLMENT_DEFAULT_SORT: FindManyOptions<TableClassroomEnrollment> = {
  orderBy: [],
};

export class EnrollmentRepository extends BaseRepository<
  TableClassroomEnrollment,
  TDataBase
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
  }

  protected override getQuerySet(): any {
    const { classId, schoolId, ...classFields } = getTableColumns(classrooms);
    return this.db
      .select({
        ...getTableColumns(classroomEnrollments),
        student: UserRepository.getVisibleColumns(),
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

  async getDashboardMetrics(
    ctx: { schoolId: string; yearId: string },
    tx: TDataBase = this.db,
  ) {
    try {
      const [results] = await tx
        .select({
          total: count(),
          news: sql<number>`count(case when ${classroomEnrollments.isNewStudent} = true then 1 end)`,
        })
        .from(classroomEnrollments)
        .where(
          and(
            eq(classroomEnrollments.schoolId, ctx.schoolId),
            eq(classroomEnrollments.yearId, ctx.yearId),
          ),
        );

      const total = Number(results?.total ?? 0);
      const news = Number(results?.news ?? 0);

      return { total, news, oldStudents: total - news };
    } catch (error) {
      this.logError("getDashboardMetrics", error, ctx);
      throw new Error(
        "Impossible de récupérer les métriques du tableau de bord.",
      );
    }
  }

  async getCountByClass(
    ctx: { schoolId: string; yearId: string },
    tx: TDataBase = this.db,
  ) {
    try {
      return await tx
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
            eq(classroomEnrollments.schoolId, ctx.schoolId),
            eq(classroomEnrollments.yearId, ctx.yearId),
          ),
        )
        .groupBy(
          classroomEnrollments.classroomId,
          classrooms.identifier,
          classrooms.shortIdentifier,
        )
        .orderBy(classrooms.shortIdentifier);
    } catch (error) {
      this.logError("getCountByClass", error, ctx);
      throw new Error("Erreur lors du calcul des effectifs par classe.");
    }
  }
}
