import { eq, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "../config";
import { getLogger } from "@/packages/logger";
import {
  classrooms,
  options,
  studyYears,
  classroomEnrollments,
  users,
  seatingAssignments,
  type TableClassroom,
  type TableClassroomEnrollment,
  type TableSeatingAssignment,
} from "../schemas/schema";
import { getVisibleUserColumns } from "./user.query";
import { BaseRepository } from "./base-repository";
import { applyQueryOptions, extractQueryPayload } from "./drizzle-builder";
import type {
  TClassroom,
  FindManyOptions,
  TEnrolement,
  TUser,
} from "../schemas/types";
import { compareByFullName, withFullName } from "./query-utils";

interface GetClassroomsOptions {
  classroomOptions?: Partial<FindManyOptions<TableClassroom>>;
  enrollmentOptions?: Partial<FindManyOptions<TableClassroomEnrollment>>;
  assignementOptions?: Partial<FindManyOptions<TableSeatingAssignment>>;
}
export type TClassroomDTO = TClassroom & {
  optionName: string | null;
  optionShortName: string | null;
  yearName: string;
  startDate: Date;
  endDate: Date;
};

const CLASSROOM_DEFAULT_SORT: FindManyOptions<TableClassroom> = {
  orderBy: [
    { column: "identifier", order: "asc" },

    { column: "shortIdentifier", order: "asc" },
  ],
};

export class ClassroomQuery extends BaseRepository<TableClassroom, TDataBase> {
  private readonly selection = {
    ...getTableColumns(classrooms),
    optionName: options.optionName,
    optionShortName: options.optionShortName,
    yearName: studyYears.yearName,
    startDate: studyYears.startDate,
    endDate: studyYears.endDate,
  };

  constructor() {
    super({
      db,
      table: classrooms,
      idColumn: classrooms.classId,
      entityName: "Classroom",
      logger: getLogger,
      defaultSort: CLASSROOM_DEFAULT_SORT,
    });
  }

  /**
   * Version étendue avec Jointures SQL (Performance brute)
   */
  async findManyExtended(
    filters?: FindManyOptions<TableClassroom>,
  ): Promise<TClassroomDTO[]> {
    try {
      const query = this.db
        .select(this.selection)
        .from(classrooms)
        .innerJoin(studyYears, eq(classrooms.yearId, studyYears.yearId))
        .leftJoin(options, eq(classrooms.optionId, options.optionId))
        .$dynamic();

      return (await applyQueryOptions(
        query,
        classrooms,
        filters as any,
      )) as TClassroomDTO[];
    } catch (error) {
      this.logError("findManyExtended", error, { filters });
      throw new Error("Erreur lors de la récupération des classes enrichies.");
    }
  }

  /**
   * Recherche par ID avec relations à plat
   */
  override async findById(classId: string) {
    if (!classId) return null;
    try {
      const [result] = await this.db
        .select(this.selection)
        .from(classrooms)
        .leftJoin(options, eq(classrooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classrooms.yearId, studyYears.yearId))
        .where(eq(classrooms.classId, classId))
        .limit(1);

      return result || null;
    } catch (error) {
      this.logError("findById", error, { classId });
      throw new Error("Impossible de trouver la classe spécifiée.");
    }
  }

  async findWithEnrollments(filters: FindManyOptions<TableClassroom> = {}) {
    try {
      const query = this.db
        .select({
          classroom: classrooms,
          option: options,
          studyYear: studyYears,
          enrollment: classroomEnrollments,
          user: getVisibleUserColumns(),
        })
        .from(classrooms)
        .leftJoin(options, eq(classrooms.optionId, options.optionId))
        .leftJoin(studyYears, eq(classrooms.yearId, studyYears.yearId))
        .leftJoin(
          classroomEnrollments,
          eq(classrooms.classId, classroomEnrollments.classroomId),
        )
        .leftJoin(users, eq(classroomEnrollments.studentId, users.userId))
        .$dynamic();
      return await applyQueryOptions(query, classrooms, filters);
    } catch (error) {
      this.logError("findWithEnrollments", error, { ...filters });
      throw new Error("Erreur lors de la récupération des inscriptions.");
    }
  }

  private formatClassrooms<
    T extends { enrollments: (TEnrolement & { student: TUser })[] },
  >(classrooms: T[]) {
    return classrooms.map(({ enrollments, ...classroom }) => {
      const sortedEnrollments = enrollments.sort(
        compareByFullName((e) => e.student),
      );

      return {
        ...classroom,
        enrollments: sortedEnrollments.map((e) => ({
          ...e,
          student: withFullName(e.student),
        })),
      };
    });
  }

  async getClassroomsWithStudents({
    classroomOptions = {},
    enrollmentOptions = {},
  }: GetClassroomsOptions = {}) {
    const classroomsQueries = await this.db.query.classrooms.findMany({
      ...extractQueryPayload(this.table, classroomOptions),
      with: {
        enrollments: {
          ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
          with: { student: true },
        },
      },
    });

    return this.formatClassrooms(classroomsQueries);
  }

  async getClassroomsWithStudentAndAssignement({
    classroomOptions = {},
    enrollmentOptions = {},
    assignementOptions = {},
  }: GetClassroomsOptions = {}) {
    const classroomsQueries = await this.db.query.classrooms.findMany({
      ...extractQueryPayload(this.table, classroomOptions),
      with: {
        enrollments: {
          ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
          with: {
            student: true,
            seatingAssignments: {
              ...extractQueryPayload(seatingAssignments, assignementOptions),
              with: { localRoom: true },
            },
          },
        },
      },
    });

    return this.formatClassrooms(classroomsQueries);
  }

  // ClassroomWithAssignments

  private normalizeEnrollments(classrooms: any[]) {
    return classrooms.map((classroom) =>
      classroom.enrollments.map((enrollment) => {
        const [firstAssignment] = enrollment.seatingAssignments ?? [];

        return {
          ...enrollment,
          assignment: firstAssignment ?? null,
        };
      }),
    );
  }

  static instance = new ClassroomQuery();
}

export const classroomService = ClassroomQuery.instance;
