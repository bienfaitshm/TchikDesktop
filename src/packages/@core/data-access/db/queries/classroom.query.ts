import { eq, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "../config";
import { getLogger } from "@/packages/logger";
import {
  classRooms,
  options,
  studyYears,
  classroomEnrolements,
  users,
  seatingAssignments,
  type TableClassroom,
  type TableClassroomEnrolement,
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
  enrollmentOptions?: Partial<FindManyOptions<TableClassroomEnrolement>>;
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
    ...getTableColumns(classRooms),
    optionName: options.optionName,
    optionShortName: options.optionShortName,
    yearName: studyYears.yearName,
    startDate: studyYears.startDate,
    endDate: studyYears.endDate,
  };

  constructor() {
    super({
      db,
      table: classRooms,
      idColumn: classRooms.classId,
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
        .from(classRooms)
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .$dynamic();

      return (await applyQueryOptions(
        query,
        classRooms,
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
  override async findById(classId: string): Promise<TClassroomDTO | null> {
    if (!classId) return null;
    try {
      const [result] = await this.db
        .select(this.selection)
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .innerJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .where(eq(classRooms.classId, classId))
        .limit(1);

      return (result as TClassroomDTO) || null;
    } catch (error) {
      this.logError("findById", error, { classId });
      throw new Error("Impossible de trouver la classe spécifiée.");
    }
  }

  async findWithEnrollments(filters: FindManyOptions<TableClassroom> = {}) {
    try {
      const query = this.db
        .select({
          classroom: classRooms,
          option: options,
          studyYear: studyYears,
          enrollment: classroomEnrolements,
          user: getVisibleUserColumns(),
        })
        .from(classRooms)
        .leftJoin(options, eq(classRooms.optionId, options.optionId))
        .leftJoin(studyYears, eq(classRooms.yearId, studyYears.yearId))
        .leftJoin(
          classroomEnrolements,
          eq(classRooms.classId, classroomEnrolements.classroomId),
        )
        .leftJoin(users, eq(classroomEnrolements.studentId, users.userId))
        .$dynamic();
      return await applyQueryOptions(query, classRooms, filters);
    } catch (error) {
      this.logError("findWithEnrollments", error, { ...filters });
      throw new Error("Erreur lors de la récupération des inscriptions.");
    }
  }

  private formatClassrooms<
    T extends { enrolements: (TEnrolement & { student: TUser })[] },
  >(classrooms: T[]) {
    return classrooms.map(({ enrolements, ...classroom }) => {
      const sortedEnrollments = enrolements.sort(
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
    const classrooms = await this.db.query.classRooms.findMany({
      ...extractQueryPayload(this.table, classroomOptions),
      with: {
        enrolements: {
          ...extractQueryPayload(classroomEnrolements, enrollmentOptions),
          with: { student: true },
        },
      },
    });

    return this.formatClassrooms(classrooms);
  }

  async getClassroomsWithStudentAndAssignement({
    classroomOptions = {},
    enrollmentOptions = {},
    assignementOptions = {},
  }: GetClassroomsOptions = {}) {
    const classrooms = await this.db.query.classRooms.findMany({
      ...extractQueryPayload(this.table, classroomOptions),
      with: {
        enrolements: {
          ...extractQueryPayload(classroomEnrolements, enrollmentOptions),
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

    return this.formatClassrooms(classrooms);
  }

  static instance = new ClassroomQuery();
}

export const classroomService = ClassroomQuery.instance;
