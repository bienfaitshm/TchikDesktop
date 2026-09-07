import { eq, and, sql, count, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classroomEnrollments,
  classrooms,
  studyYears,
  type TableClassroomEnrollment,
  type ClassroomEnrollment,
  type User,
  type Classroom,
  tutors,
} from "@/packages/@core/data-access/db/schemas/schema";
import {
  DatabaseError,
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";

import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db/options";

import { UserRepository } from "../users";
import { TutorDTO, TutorRepository } from "../tutors";

export type EnrollmentDTO = ClassroomEnrollment & {
  student: User & { fullName: string };
  classroom: Omit<Classroom, "classId" | "schoolId">;
  yearName: string;
  tutor?: TutorDTO;
};

const JOINED_TABLES = {
  classrooms,
  users: UserRepository.studentUsers,
  classroomEnrollments,
  tutors,
} as const;

/**
 * Filter configuration type for standard classroom lists.
 */
export type BaseClassroomEnrollmentFilters = helpers.FindManyOptions<
  typeof JOINED_TABLES
>;

const ENROLLMENT_DEFAULT_SORT: BaseClassroomEnrollmentFilters = {
  orderBy: [
    { table: "classroomEnrollments", column: "createdAt", order: "desc" },
  ],
};

const ACTIVE_ENROLLEMENTS: BaseClassroomEnrollmentFilters = {
  where: {
    classroomEnrollments: {
      status: STUDENT_STATUS_ENUM.ACTIVE,
    },
  },
};

export function extractEnrollmentFiltersQueryPayload(
  filters: BaseClassroomEnrollmentFilters,
) {
  return helpers.extractQueryPayload(JOINED_TABLES, filters);
}

export class EnrollmentRepository
  extends betterSqlite.BaseRepository<
    TableClassroomEnrollment,
    TDataBase,
    EnrollmentDTO,
    BaseClassroomEnrollmentFilters
  >
  implements OptionProvider<EnrollmentDTO>
{
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: classroomEnrollments,
      idColumn: classroomEnrollments.enrollmentId,
      baseTableName: "classroomEnrollments",
      logger: getLogger,
      defaultFilters: ENROLLMENT_DEFAULT_SORT,
      joinTables: JOINED_TABLES,
    });
  }

  fetchOptions(filters: BaseClassroomEnrollmentFilters): EnrollmentDTO[] {
    return this.findMany(filters);
  }

  public getDTOColumns() {
    return {
      ...getTableColumns(this.table),
      student: UserRepository.getVisibleColumns(UserRepository.studentUsers),
      classroom: getTableColumns(classrooms),
      tutor: TutorRepository.getDTOColumns(tutors),
      yearName: studyYears.yearName,
    };
  }

  /**
   * Marks one or multiple students as Pro Deo within a specific school.
   * @param enrollmentIds - Single enrollment identifier or an array of enrollment identifiers.
   * @param schoolId - The unique identifier of the school.
   * @returns A promise resolving to the result of the database update operation.
   */
  public markStudentsAsProDeo(
    enrollmentIds: string | string[],
    schoolId: string,
  ) {
    const ids = Array.isArray(enrollmentIds) ? enrollmentIds : [enrollmentIds];

    return this.update(
      { isProDeo: true },
      {
        where: {
          classroomEnrollments: {
            schoolId,
            enrollmentId: { $in: ids },
          },
        },
      },
    );
  }

  /**
   * Surcharge propre du QuerySet de base pour inclure systématiquement les relations
   */
  protected override getQuerySet(tx?: TDataBase) {
    const client = this.getClient(tx);
    return client
      .select(this.getDTOColumns())
      .from(this.table)
      .leftJoin(tutors, eq(this.table.tutorId, tutors.tutorId))
      .leftJoin(
        UserRepository.tutorUsers,
        eq(UserRepository.tutorUsers.userId, tutors.userId),
      )
      .innerJoin(
        UserRepository.studentUsers,
        eq(this.table.studentId, UserRepository.studentUsers.userId),
      )
      .innerJoin(classrooms, eq(this.table.classroomId, classrooms.classId))
      .innerJoin(studyYears, eq(this.table.yearId, studyYears.yearId))
      .$dynamic();
  }

  /**
   * Récupère uniquement les inscriptions actives (allégées pour traitement lourd ou filtres internes)
   */
  getActiveEnrollments(
    filters: BaseClassroomEnrollmentFilters,
    tx?: TDataBase,
  ) {
    try {
      const query = this.getQuerySet(tx);
      const result = helpers.applyQueryOptions(
        query,
        this.getJoinTable(),
        helpers.mergeFindManyOptions(filters, ACTIVE_ENROLLEMENTS),
      );
      return result.all();
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch active enrollments for school ${filters}`,
      );
      this.logError("getActiveEnrollments", dbError, filters as any);
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
