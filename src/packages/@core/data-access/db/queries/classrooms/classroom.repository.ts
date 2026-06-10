import { eq, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  classrooms,
  options,
  studyYears,
  classroomEnrollments,
  seatingAssignments,
  type TableClassroom,
  type TableClassroomEnrollment,
  type TableSeatingAssignment,
} from "@/packages/@core/data-access/db/schemas/schema";
import { BaseRepository, LibSqlClient } from "../base-repository";
import { extractQueryPayload } from "../drizzle-builder";
import type { FindManyOptions } from "../../schemas/types";

interface GetClassroomsOptions {
  classroomOptions?: Partial<FindManyOptions<TableClassroom>>;
  enrollmentOptions?: Partial<FindManyOptions<TableClassroomEnrollment>>;
  assignmentOptions?: Partial<FindManyOptions<TableSeatingAssignment>>;
}

const CLASSROOM_DEFAULT_SORT: FindManyOptions<TableClassroom> = {
  orderBy: [
    { column: "identifier", order: "asc" },
    { column: "shortIdentifier", order: "asc" },
  ],
};

export class ClassroomRepository extends BaseRepository<
  TableClassroom,
  TDataBase
> {
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

  override getQuerySet(tx?: LibSqlClient) {
    return this.getClient(tx)
      .select(this.selection)
      .from(classrooms)
      .innerJoin(studyYears, eq(classrooms.yearId, studyYears.yearId))
      .leftJoin(options, eq(classrooms.optionId, options.optionId))
      .$dynamic();
  }
  /**
   * Récupère les classes avec les étudiants associés via Drizzle Relational API
   */
  async findClassroomsWithStudents({
    classroomOptions = {},
    enrollmentOptions = {},
  }: GetClassroomsOptions = {}) {
    try {
      return await this.db.query.classrooms.findMany({
        ...extractQueryPayload(this.table, classroomOptions),
        with: {
          enrollments: {
            ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
            with: { student: true },
          },
        },
      });
    } catch (error) {
      this.logError("findClassroomsWithStudents", error, { classroomOptions });
      throw new Error(
        "Erreur lors de la récupération des classes et de leurs étudiants.",
      );
    }
  }

  /**
   * Récupère les classes, étudiants et assignations de places
   */
  async findClassroomsWithStudentAndAssignments({
    classroomOptions = {},
    enrollmentOptions = {},
    assignmentOptions = {},
  }: GetClassroomsOptions = {}) {
    try {
      return await this.db.query.classrooms.findMany({
        ...extractQueryPayload(this.table, classroomOptions),
        with: {
          enrollments: {
            ...extractQueryPayload(classroomEnrollments, enrollmentOptions),
            with: {
              student: true,
              seatingAssignments: {
                ...extractQueryPayload(seatingAssignments, assignmentOptions),
                with: { localroom: true },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logError("findClassroomsWithStudentAndAssignments", error, {
        classroomOptions,
      });
      throw new Error(
        "Erreur lors de la récupération complète des assignations.",
      );
    }
  }
}
